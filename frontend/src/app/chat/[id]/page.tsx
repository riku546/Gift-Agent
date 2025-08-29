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

interface shopItem {
	Name: string;
	Property: { Address: string };
}
interface ResFromLLM {
	items: RakutenItem[];
	image: string;
	map_items: shopItem[];
}

const getLocation = (): Promise<{ lat: number; lng: number }> => {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation not supported"));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
			(err) => reject(err),
		);
	});
};

export default function Home() {
	const [isLoading, setIsLoading] = useState(false);
	const [resFromLLM, setResFromLLM] = useState<null | ResFromLLM>(null);

	const handleFileUploadAndTextSubmit = useCallback(async () => {
		setIsLoading(true);

		const text_data = localStorage.getItem("text_file");
		const user_input = localStorage.getItem("user_input");

		if (!text_data || !user_input) {
			throw new Error("ファイルとテキストが正常にアップロードされていません。");
		}

		const { lat, lng } = await getLocation();

		try {
			const response = await fetch("http://localhost:8000/gift_search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user_input, text_data, lat, lng }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log(result);

			setResFromLLM({
				items: result.items.items,
				image: result.image,
				map_items: result.map_items.stores,
			});
		} catch (error) {
			console.error("Error uploading file and text:", error);
			alert("エラーが発生しました。");
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
			<div className="flex-1 flex flex-col items-center justify-center gap-15">
				{isLoading && (
					<>
						<h1 className="text-4xl text-blue-400 mb-8">Gift Agent</h1>
						<CircularProgress size={80} />
					</>
				)}
				{resFromLLM && (
					<>
						<h2 className="text-xl text-blue-400 mb-4">楽天市場の商品</h2>
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
						<h2 className="text-xl text-blue-400 mb-4">近くの店舗</h2>
						<div className="flex flex-col gap-4">
							{resFromLLM.map_items.map((item) => {
								return (
									<div key={item.Name}>
										<p>{item.Name}</p>
										<p>{item.Property.Address}</p>
									</div>
								);
							})}
						</div>
					</>
				)}
				{resFromLLM && (
					<>
						<Typography className="text-xl text-blue-400 mb-4">
							友人へのプレゼント画像
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
