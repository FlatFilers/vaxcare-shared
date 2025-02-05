import { Flatfile } from '@flatfile/api'
import { WorkbookCapture } from '@flatfile/util-extractor'
import { ExtractOptions } from '../index'

export async function TabularExtract(
        buffer: Buffer,
        options: ExtractOptions
      ): Promise<WorkbookCapture> {
        try {

            // Convert CSV buffer to string
            const csvContent = buffer.toString('utf-8')
            //console.log(csvContent)

            // Extract tables using OpenAI API
            const workbook = await extractByAnthropic(csvContent);
            return workbook as WorkbookCapture;


            
        } catch (error) {
            console.log('An error occurred:', error)
            throw error
          }
}

async function extractByAnthropic(csvContent: string): Promise<WorkbookCapture> {
    const AnthropicEndpoint = 'https://api.anthropic.com/v1/messages'

    const responseAnthropic = await fetch(AnthropicEndpoint, {
        method: 'POST',
        headers: {
            'x-api-key': `${process.env.ANTHROPIC_KEY}`,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            temperature: 0,
            system: "Locate all tables that are present in the csv text.\n" 
                    + "Return ONLY A JSON ('tables': []) answer containing the following objects per table:\n" 
                    + "tableName - the short name for the table, if no name is found  just leave null\n"
                    + "headerRow - the EXACT content of the header row of the table - DO NOT ADD Anything\n" 
                    + "lastTableRow - the EXACT content of the last row of the table - DO NOT ADD Anything\n" 
                    + "columnsUsedForFilter - name and value of each column that has been used to filter. Filters might be defined by if or not. If not found set it to and empty array. Please be careful there might be more than one condition and even filters in more than one line",
            messages: [
                {
                    "role": "user", 
                    "content": [
                        {
                            "type": "text",
                            "text": csvContent
                        }
                    ]
                }
            ]
        })
    })
    
    // Check if the response is okay
    if (!responseAnthropic.ok) {
        throw new Error("Can't extract data from CSV")
    }

    const responseData = await responseAnthropic.json() as {
        content: Array<{
            text: string
        }>
    };
       
    let workbook: WorkbookCapture = {};

    if (responseData.content?.[0]?.text) {
        const answer = JSON.parse(responseData.content[0].text);
        
        // Process each table in the response
        for (const table of answer.tables) {
            const csvLines = csvContent.split('\n');
            let headers: string[] = [];
            let filteredColumns: any[] = [];
            let data: Flatfile.RecordData[] = [];
            let metadata: any = {}
            
            // Find the header row index
            const headerIndex = csvLines.findIndex(line => line.trim() === table.headerRow.trim());
            if (headerIndex === -1) continue;
            
            // Parse headers
            headers = table.headerRow.split(',').map(h => h.trim()).filter(h => h !== '');
            filteredColumns = table.columnsUsedForFilter;

            // Find all data rows between header and last row
            const lastRowIndex = csvLines.findIndex((line, index) => 
                index > headerIndex && line.replace(/,/g, '').trim() === table.lastTableRow.replace(/,/g, '').trim()
            );

            // Process all rows between header and last row (inclusive)
            for (let i = headerIndex + 1; i <= lastRowIndex; i++) {
                const row = csvLines[i].split(',');
                var record = headers.reduce((acc, header, index) => ({
                    ...acc,
                    [header]: { value: row[index]?.trim() || '' }
                }), {});
                data.push(record);
            }

            filteredColumns.forEach(column => {                    
                if (!headers.some(h => h.toLowerCase() === column.name.toLowerCase())) {
                    headers.push("filtered_" + column.name);
                    data.forEach(record => {
                        record["filtered_" + column.name] = { value: column.value || '' };
                    });
                }
            });

            // Add table to workbook
            const tableName = table.tableName || `Table_${Object.keys(workbook).length + 1}`;
            workbook[tableName] = {
                headers,
                data,
                metadata
            };
        }
    }

    return workbook;
}

async function extractByOpenAI(csvContent: string): Promise<WorkbookCapture> {
    const OpenAiEndpoint = 'https://api.openai.com/v1/chat/completions'
    
    const responseOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            "response_format": {
              "type": "json_object"
            },
            "temperature": 1,
            "max_completion_tokens": 16383,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            messages: [
                {
                    role: 'system',
                    content: "Extract all tables that are located in the csv file. "
                            + "There is a filtering line above the tables with one or more contitions in the following format 'colum=value columme2=value2 ..'. "
                            + "The columns that have been used for the conditions might be missing in the table, identifiy all the missing columns. "
                            + "Return the following json tables: [{tableName, tableHeader, tableContent, filteredColumns[{name, value}]}]. "
                },
                {
                    role: 'user',
                    content: csvContent
                }
            ]
        })
    });

    // Check if the response is okay
    if (!responseOpenAI.ok) {
        throw new Error("Can't extract data from CSV")
    }
    const responseData = await responseOpenAI.json() as {
        choices: [{
            message: {
                content: string
            }
        }]
    };
    
    var answerText = responseData.choices[0].message.content.trim();
    answerText = answerText.replace(/```json\n|```/g, '');
    let answer = JSON.parse(answerText);

    let workbook: WorkbookCapture = {};

    if (answer) {
        // Split CSV content into lines for processing
        const csvLines = csvContent.split('\n')
        // Process each table found in the response
        for (const table of answer.tables) {

            if (table.tableContent) {

                let headers: string[] = []
                let data: Flatfile.RecordData[] = []
                let metadata: any = {}
                headers = table.tableHeader;

                table.tableContent.forEach(row => {
                    // Create an object mapping headers to values at same index
                    const record = headers.reduce((acc, header, index) => ({
                        ...acc,
                        [header]: { value: row[index] || '' }
                    }), {});
                    
                    data.push(record);
                });

                workbook[table.tableName] = {
                    headers,
                    data,
                    metadata,
                }
            }
        }
    }
    return workbook;
}
