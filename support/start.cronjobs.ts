import { FlatfileClient } from "@flatfile/api";
import { LocalCronJob } from "./utils/cronjobs";

export async function startCronJobs() {
  const flatfile = new FlatfileClient({ token: process.env.FLATFILE_TOKEN });
  const environment = await flatfile.environments.get(process.env.FLATFILE_ENVIRONMENT_ID);
  LocalCronJob.startAll(environment.data.accountId, environment.data.id);
}
