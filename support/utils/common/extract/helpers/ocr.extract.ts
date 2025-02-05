import { Flatfile } from '@flatfile/api'
import { WorkbookCapture } from '@flatfile/util-extractor'
import { ExtractOptions } from '../index'

export async function OCRExtract(
        buffer: Buffer,
        options: ExtractOptions
      ): Promise<WorkbookCapture> {
        try {
            const AzureEndpoint = `${process.env.AZURE_ENDPOINT}/documentintelligence/documentModels/prebuilt-layout:analyze?api-version=2024-11-30&outputContentFormat=markdown`
            const AzureKey = process.env.AZURE_KEY

            const OpenAiEndpoint = 'https://api.openai.com/v1/chat/completions'
            const OpenAiKey = process.env.OPENAI_KEY

            let headers: string[] = []
            let data: Flatfile.RecordData[] = []
            let metadata: any = {}

            //Covert blob to base64
            const base64 = Buffer.from(buffer).toString('base64')
            //Send to Azure
            const response = await fetch(AzureEndpoint, {
                method: 'POST',
                headers: {
                  'Ocp-Apim-Subscription-Key': `${AzureKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base64Source: base64
                }),
              });
            // Check if the response is okay
            if (!response.ok) {
                throw new Error("Can't convert PDF to markdown")
            }else{
                const operationLocation = response.headers.get('operation-location')
                let content = ""
                if(operationLocation){
                    //Get response and check if response status field is "succeeded" if not retry
                    let status = "running";
                    while (status === "running" || status === "notStarted") {
                        const responseGet = await fetch(operationLocation, {
                            method: 'GET',
                            headers: {
                              'Ocp-Apim-Subscription-Key': `${AzureKey}`
                            },
                        })  
                        const responseGetJson = await responseGet.json() as any;
                        status = responseGetJson.status;
                        
                        if(status === "succeeded"){
                            //Get the content of the response
                            content = responseGetJson.analyzeResult.content
                        } else if (status === "running" || status === "notStarted") {
                            // Wait 1 second before trying again
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }else{
                            throw new Error("Can't convert PDF to markdown")
                        }
                    }

                    if(content){
                        const responseOA = await fetch(OpenAiEndpoint, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${OpenAiKey}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              model: 'gpt-3.5-turbo', 
                              messages: [
                                {
                                  role: "system",
                                  content: "You know the following document types and associated fields: " + JSON.stringify(options.doc_types) 
                                            + ". You will receive a document markdown. Classify the document into one of the document types and extract the associated fields." 
                                            + "Only return a json of the fields and associated values in the structure of [{\"field1\": \"value1\", \"field2\": \"value2\", ...}]. ALWAYS stick to this structure including the quotes."
                                            + "If there are multiple values for a field (for example a table with multiple rows), return a list of the defined structure."
                                            //+ "If you return a list with multiple rows, add values that are only found once per document to each object in the list and don't return them as a separate object."
                                            + "If you can't classify or don't find any values, " 
                                            + "return [{\"Message\": \"Couldn't find a document type\"}] or [{\"Message\": \"Couldn't find any values\"}]"
                                },
                                {
                                  role: "user",
                                  content: content
                                }]
                            }),
                          });
                          
                          // Check if the response is okay
                            if (!responseOA.ok) {
                                throw new Error("Can't extract data from PDF")
                            }else{
                                const responseData = await responseOA.json() as {
                                    choices: [{
                                        message: {
                                            content: string
                                        }
                                    }]
                                };
                                
                                var answer = responseData.choices[0].message.content.trim();
                                answer = answer.replace(/```json\n|```/g, '');
                                answer = JSON.parse(answer);
                                
                                if (Array.isArray(answer)) {
                                    // Collect all unique keys across all objects
                                    headers = [...new Set(answer.flatMap(obj => Object.keys(obj)))];
                                }
                                
                                // Create a single record with all the extracted fields
                                if (Array.isArray(answer)) {
                                    answer.forEach(row => {
                                        // Create an object with all headers initialized to empty values
                                        const record = headers.reduce((acc, header) => ({
                                            ...acc,
                                            [header]: { value: row[header] || '' }
                                        }), {});
                                        
                                        data.push(record);
                                    });
                                }
                            }
                    }
                }
            }

            const sheetName = 'Sheet1'
            return {
            [sheetName]: {
                headers,
                data,
                metadata,
            },
            } as WorkbookCapture
        } catch (error) {
            console.log('An error occurred:', error)
            throw error
          }
}