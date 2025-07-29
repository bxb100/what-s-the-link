import { List, LaunchProps, Image } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { URLSearchParams } from "node:url";
import byteSize from "byte-size";

export default function Command(props: LaunchProps<{ arguments: Arguments.WhatslinkInfo }>) {
	const { link } = props.arguments;
	
	const { data, isLoading } = useFetch("https://whatslink.info/api/v1/link?" + new URLSearchParams({ url: link }),
  {
    headers: {
      "Referer": "https://whatslink.info/",
    },
		parseResponse: parseFetchResponse,
	});

	return (
		<List isLoading={isLoading} isShowingDetail>
			{data ? (
				<>
					<List.Item
						title="Summary"
						detail={
							<List.Item.Detail
                markdown={data.screenshots?.length > 0 ? `![Screenshot](${data.screenshots[0].screenshot})` : ""}
								metadata={
									<List.Item.Detail.Metadata>
										<List.Item.Detail.Metadata.Label title="Resource Name" text={data.name} />
										<List.Item.Detail.Metadata.Label title="Number of Files" text={String(data.count)} />
										<List.Item.Detail.Metadata.Label title="Total File Size" text={`${byteSize(data.size)}`} />
										<List.Item.Detail.Metadata.Label title="Type" text={data.type} />
										<List.Item.Detail.Metadata.Label title="File Type" text={data.file_type} />
									</List.Item.Detail.Metadata>
								}
							/>
						}
					/>

					<List.Section title="Screenshots" subtitle={data.screenshots?.length + ""}>
						{data.screenshots?.map((screenshot, index) => (
							<List.Item
                icon={getIcon(index + 1)}
                keywords={[String(index + 1), String(screenshot.time)]}
								key={screenshot.screenshot}
								title={`Screenshot at ${screenshot.time}`}
								detail={<List.Item.Detail markdown={`![Screenshot](${screenshot.screenshot})`} />}
							/>
						))}
					</List.Section>
				</>
			) : (
				<List.EmptyView
					title="No results found"
					description="Please check the link and try again."
					icon="extension_icon.png"
				/>
			)}
		</List>
	);
}

async function parseFetchResponse(response: Response) {
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Error fetching data: ${response.status} ${response.statusText} - ${errorText}`);
	}
	return (await response.json()) as InfoResponse;
}

interface InfoResponse {
	type: string;
	file_type: string;
	name: string;
	size: number;
	count: number;
	screenshots: {
		time: number;
		screenshot: string;
	}[];
}

export function getIcon(index: number): Image.ImageLike {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect x="0" y="0" width="40" height="40" fill="#DD7949" rx="10"></rect>
  <text
  font-size="22"
  fill="white"
  font-family="Verdana"
  text-anchor="middle"
  alignment-baseline="baseline"
  x="20.5"
  y="32.5">${index}</text>
</svg>
  `.replaceAll("\n", "");

  return {
    source: `data:image/svg+xml,${svg}`,
  };
}
