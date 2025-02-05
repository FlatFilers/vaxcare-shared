import api from '@flatfile/api';
import { Domain, EventTopic } from '@flatfile/api/api';
import { CronJob } from 'cron';
import { FlatfileListener, FlatfileEvent } from '@flatfile/listener';


/* The `export enum CronEventTopic {` statement in the TypeScript code snippet is defining an
enumeration called `CronEventTopic`. Enums in TypeScript allow you to define a set of named
constants, which can be numeric or string values. */
export enum CronEventTopic {
    Cron5Minutes = '5-minutes',
    CronHourly = 'hourly',
    CronDaily = 'daily'
}

/* The `CronConfig` constant is an object that maps `CronEventTopic` enum values to specific
configuration settings for cron jobs. Each key in the `CronConfig` object corresponds to a
`CronEventTopic` value and contains an object with two properties: `time` and `topic`. */
const CronConfig = {
    [CronEventTopic.Cron5Minutes]: {
        time: "*/5 * * * *",
        topic: EventTopic.Cron5Minutes
    },
    [CronEventTopic.CronHourly]: {
        time: "0 */1 * * *",
        topic: EventTopic.CronHourly
    },
    [CronEventTopic.CronDaily]: {
        time: "0 0 * * *",
        topic: EventTopic.CronDaily
    }
}

/* The `LocalCronJob` class in TypeScript provides methods to start and manage cron jobs based on
configuration settings. */
export class LocalCronJob {

    /**
     * The function `startAll` initializes and starts cron jobs based on configuration settings.
     * @param {string} accountId - The `accountId` parameter is a string that represents the unique
     * identifier of an account in the system. It is used within the `startAll` function to associate
     * the cron job events with a specific account.
     * @param {string} environmentId - The `environmentId` parameter in the `startAll` function is used
     * to specify the environment identifier where the cron jobs will be started. This parameter helps
     * in identifying the specific environment context in which the cron jobs will run.
     */
    public static startAll(accountId: string, environmentId: string) {
        global.cronJobs ||= {};
        const started = [];
        for (const cronEventTopic in CronConfig) {
            if (!global.cronJobs[cronEventTopic]) {
                started.push(cronEventTopic);
                global.cronJobs[cronEventTopic] = new CronJob(CronConfig[cronEventTopic].time, async function(){
                    await api.events.create({
                        topic: EventTopic.Cron5Minutes,
                        payload: {},
                        domain: Domain.Cron,
                        context: {
                            accountId: accountId,
                            environmentId: environmentId
                        }
                    });
                });
                global.cronJobs[cronEventTopic].start();
            }
        }
        if (started.length > 0) {
            console.log(`  ✓ Started cron jobs: ${started.join(', ')}`);
        }
    }

    /**
     * The function `start` creates a listener for a specific event and schedules a cron job to trigger
     * an API call based on the specified time interval.
     * @param {CronEventTopic} cronEventTopic - The `cronEventTopic` parameter is used to specify the
     * type of cron event topic that the function will be listening for. It is of type
     * `CronEventTopic`.
     * @param {string} createEvent - The `createEvent` parameter in the `start` function represents the
     * event that triggers the creation of a new job in the cron scheduler. This event is listened for
     * by the `FlatfileListener` to initiate the scheduling of a new job based on the specified cron
     * configuration.
     * @returns A function that takes a FlatfileListener as a parameter and sets up a listener for a
     * specified create event. When the create event is triggered, it creates a new CronJob based on
     * the specified cron event topic and schedules an API event creation based on the CronConfig
     * settings.
     */
    public static start(
        cronEventTopic: CronEventTopic,
        createEvent: string
    ) : (listener: FlatfileListener) => void {
        return (listener: FlatfileListener) => {
            listener.on(
                createEvent,
                async ({ context: { accountId, spaceId, environmentId, workbookId, actorId } }: FlatfileEvent) => {
                try {
                    const { time, topic } = CronConfig[cronEventTopic];

                    const job = new CronJob(
                        time,
                        async function(){
                            await api.events.create({
                                context: {
                                    accountId: accountId,
                                    environmentId: environmentId,
                                    spaceId: spaceId,
                                    actorId: actorId,
                                    workbookId: workbookId
                                },
                                domain: "cron",
                                topic: topic,
                                payload: {
                                }
                            });
                        },
                        null, // onComplete
                        true, // start
                        'America/New_York' // timeZone
                    );
                } catch (error) {
                    throw error;
                }
            }
        );
        
        return listener;
        };
    }
}
