import { Client, isFullDatabase, isFullPage, iteratePaginatedAPI } from '@notionhq/client';
import { DateTime } from 'luxon';
import getCronString from '@darkeyedevelopers/natural-cron.js';
import cronParser from 'cron-parser';
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

type NotionConfig = {
	apiKey: string;
	databaseId: string
};

export async function handler()
{
	// process environment variables into useful data
	if (!process.env.NOTION_KEY || !process.env.NOTION_DBID) {
		throw new Error("Notion API key or database ID not supplied");
	}

	const configs: NotionConfig[] = [];
	const apiKeys = process.env.NOTION_KEY.split(',');
	const dbIds = process.env.NOTION_DBID.split(',');
	if (apiKeys.length !== dbIds.length) {
		throw new Error("Different number of API keys and database IDs supplied");
	}

	for (let i = 0; i < apiKeys.length; i++)
	{
		configs.push({ apiKey: apiKeys[i], databaseId: dbIds[i] });
	}

	for (const config of configs)
	{
		await main(config);
	}
}

async function main(config: NotionConfig)
{
	const notion = new Client({ auth: config.apiKey });
	
	try
	{
		const lastUpdateTime = await getLastProcessedTime(notion, config.databaseId);
		await processRows(notion, config.databaseId, lastUpdateTime);
		await setLastProcessedTime(notion, config.databaseId);
	}
	catch (e)
	{
		console.error(e);
	}
}

let lastLoadedDescription: RichTextItemResponse[];

async function getLastProcessedTime(notion: Client, databaseId: string): Promise<DateTime>
{
	// get last update timestamp
	const dbDef = (await notion.databases.retrieve({ database_id: databaseId }));
	if (!isFullDatabase(dbDef)) {
		throw new Error("Partial database returned when asking for last processed time");
	}

	lastLoadedDescription = dbDef.description;
	let lastProcessedTime: DateTime;

	if (dbDef.description && dbDef.description.length >= 1)
	{
		const dateLine = dbDef.description[dbDef.description.length - 1].plain_text;
		const dateLineParts = dateLine.split(/\s+/);
		lastProcessedTime = DateTime.fromISO(dateLineParts[dateLineParts.length - 1]);
	}
	else
	{
		lastProcessedTime = DateTime.invalid("No description");
	}

	console.log(`Last processed time: ${lastProcessedTime}`);
	return lastProcessedTime;
}

async function setLastProcessedTime(notion: Client, databaseId: string)
{
	const now = DateTime.now();
	console.log(`Setting last processed time: ${now}`);

	const newDescription = (lastLoadedDescription ?? [null]).map(dResponse => {
		return {
			text: {
				content: dResponse?.plain_text ?? ""
			}
		};
	});
	newDescription[newDescription.length - 1].text.content = `Recurring events last processed: ${now.toISO()}`;

	await notion.databases.update({
		database_id: databaseId,
		description: newDescription
	});
}

async function processRows(notion: Client, databaseId: string, since: DateTime)
{
	// get rows updated since last check
	const recentlyUpdatedRows = iteratePaginatedAPI(notion.databases.query, {
		database_id: databaseId,
		filter: !since.isValid ? undefined : {
			property: "Last Edited Time",
			date: {
				after: since.toISO()
			}
		}
	});

	for await (const page of recentlyUpdatedRows)
	{
		if (!isFullPage(page)) {
			continue;
		}

		// ignore rows with no recurring interval
		const recurringProp = page.properties["Recurring"];
		if (recurringProp?.type !== "rich_text" || !recurringProp.rich_text?.[0]?.plain_text) {
			console.log("Skipping non-recurring task");
			continue;
		}

		// ignore rows with no due date
		const dueDateProp = page.properties["Due Date"];
		if (dueDateProp?.type !== "date" || !dueDateProp.date?.start) {
			console.log("Skipping task with uncertain due date");
			continue;
		}

		// ignore rows whose due date has not passed
		const dueDate = DateTime.fromISO(dueDateProp.date.start);
		if (dueDate.diffNow().as('days') > 0) {
			console.log("Skipping task not yet due");
			continue;
		}

		// ignore rows that are not yet done
		const doneProp = page.properties["Done"];
		if (doneProp?.type !== "checkbox" || !doneProp?.checkbox.valueOf) {
			console.log("Skipping undone task");
			continue;
		}

		await updateRow(notion, page.id, recurringProp.rich_text[0].plain_text);
	}
}

async function updateRow(notion: Client, pageId: string, recurring: string)
{
	const cronString = getCronString(recurring, "0 MIN HOR DOM MON WEK")
		.replace(/\?/g, "*")
		.replace("SUN", "0")
		.replace("MON", "1")
		.replace("TUE", "2")
		.replace("WED", "3")
		.replace("THU", "4")
		.replace("FRI", "5")
		.replace("SAT", "6");
	console.log(`Parsed "${recurring}" to cron expression ${cronString}`);
	const interval = cronParser.parseExpression(cronString);
	const newDueDate = DateTime.fromISO(interval.next().toISOString());
	console.log(`Next recurrence on ${newDueDate}`);

	await notion.pages.update({
		page_id: pageId,
		properties: {
			"Due Date": {
				date: {
					start: newDueDate.toISODate()
				}
			},
			"Done": {
				checkbox: false
			}
		}
	});
}
