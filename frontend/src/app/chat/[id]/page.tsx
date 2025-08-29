"use client";

import Sidebar from "@/components/common/sideBar";
import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

interface RakutenItem {
	itemName: string;
	itemPrice: number;
	itemUrl: string;
	mediumImageUrls: string[];
}

interface ResFromLLM {
	items: RakutenItem[];
	image: string;
}

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);
	const [resFromLLM, setResFromLLM] = useState<null | ResFromLLM>(null);

	const handleFileUploadAndTextSubmit = useCallback(async () => {
		setIsLoading(true);

		const formData = new FormData();

		const text_data = localStorage.getItem("text_file");
		const user_input = localStorage.getItem("user_input");

		if (!text_data || !user_input) {
			throw new Error("ファイルとテキストが正常にアップロードされていません。");
		}

		formData.append("user_input", user_input);
		formData.append("text_data", text_data);

		try {
			const response = await fetch("http://localhost:8000/gift_search", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			console.log(result);
			setResFromLLM({
				items: result.items.items,
				image: result.image,
			});
		} catch (error) {
			console.error("Error uploading file and text:", error);
			alert("ファイルのアップロード中にエラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		handleFileUploadAndTextSubmit();
	}, [handleFileUploadAndTextSubmit]);

	return (
		<div className="flex min-h-screen bg-gray-900 text-white p-5">
			<Sidebar />
			<MainContent isLoading={isLoading} resFromLLM={resFromLLM} />
		</div>
	);
}

const MainContent = ({
	isLoading,
	resFromLLM,
}: {
	isLoading: boolean;
	resFromLLM: ResFromLLM | null;
}) => {
	return (
		<div className="flex-1 flex flex-col p-5">
			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col items-center justify-center">
				{isLoading && (
					<>
						<h1 className="text-4xl text-blue-400 mb-8">Gift Agent</h1>
						<CircularProgress size={80} />
					</>
				)}
				{resFromLLM && (
					<>
						<h2 className="text-xl text-blue-400 mb-4">生成結果</h2>
						<div className="grid  grid-cols-2 gap-4">
							{resFromLLM.items.map((item) => {
								return (
									<ImgMediaCard
										key={item.itemName}
										imageUrl={item.mediumImageUrls[0]}
										itemName={item.itemName}
										itemPrice={item.itemPrice}
										itemUrl={item.itemUrl}
									/>
								);
							})}
						</div>
					</>
				)}

				{resFromLLM && (
					<>
						<Typography className="text-xl text-blue-400 mb-4">
							プレゼント画像
						</Typography>
						<Image
							width={500}
							height={500}
							src={resFromLLM.image}
							alt="generated image"
						/>
					</>
				)}
			</div>
		</div>
	);
};

function ImgMediaCard({
	imageUrl,
	itemName,
	itemPrice,
	itemUrl,
}: {
	imageUrl: string;
	itemName: string;
	itemPrice: number;
	itemUrl: string;
}) {
	return (
		<Card sx={{ maxWidth: 500 }}>
			<CardMedia
				component="img"
				alt="green iguana"
				height="140"
				image={imageUrl}
			/>
			<CardContent>
				<Typography className="text-gray-500">{itemPrice}円</Typography>
				<Typography variant="h6" sx={{ color: "text.secondary" }}>
					{itemName}
				</Typography>
			</CardContent>
			<CardActions>
				<a href={itemUrl}>商品ページ</a>
			</CardActions>
		</Card>
	);
}
