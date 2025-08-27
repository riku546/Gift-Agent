"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MenuIcon from "@mui/icons-material/Menu";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import AddIcon from "@mui/icons-material/Add";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Link from "next/link";
import { useRef } from "react";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

export default function Home() {
	const [inputValue, setInputValue] = useState("");
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const recentChats = [
		"セールスプレインインダー...",
		"valueup",
		"エンジニア長期インターン...",
		"LINE履歴からの商品推薦は...",
		"lineアプリでトーク履歴をダ...",
		"line apiで友人の誕生日を取...",
		"LLM生成結果のPDF化不可",
		"GCPとGeminiを活用したソ...",
		"RAGが存在する理由3選",
		"MCPとAIエージェントの関係",
		"エンジニアインターン自己P...",
	];

	const handleFileUploadAndTextSubmit = async (
		text: string,
		file: File | null,
	) => {
		if (!text && !file) {
			console.warn("テキストまたはファイルが選択されていません。");
			return;
		}

		const formData = new FormData();
		if (text) {
			formData.append("user_input", text);
		}
		if (file) {
			formData.append("file", file);
		}

		try {
			const response = await fetch("http://localhost:8000/uploadfile", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log("Upload successful:", result);
			alert("ファイルとテキストが正常にアップロードされました！");
		} catch (error) {
			console.error("Error uploading file and text:", error);
			alert("ファイルのアップロード中にエラーが発生しました。");
		}
	};

	return (
		<div className="flex h-screen bg-gray-900 text-white p-5">
			<Sidebar
				isDrawerOpen={isDrawerOpen}
				setIsDrawerOpen={setIsDrawerOpen}
				recentChats={recentChats}
			/>
			<MainContent
				inputValue={inputValue}
				setInputValue={setInputValue}
				selectedFile={selectedFile}
				setSelectedFile={setSelectedFile}
				fileInputRef={fileInputRef}
				handleFileUploadAndTextSubmit={handleFileUploadAndTextSubmit}
			/>
		</div>
	);
}

interface SidebarProps {
	isDrawerOpen: boolean;
	setIsDrawerOpen: (isOpen: boolean) => void;
	recentChats: string[];
}

function Sidebar({ isDrawerOpen, setIsDrawerOpen, recentChats }: SidebarProps) {
	return (
		<Drawer direction="left" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
			<DrawerTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="text-gray-400 hover:text-white hover:bg-gray-900"
				>
					<MenuIcon sx={{ fontSize: 35 }} />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="bg-gray-900 border-r border-gray-700 flex flex-col mt-0 h-screen">
				{/* Header */}
				<div className="p-4 border-b border-gray-700">
					<div className="flex items-center justify-between mb-4">
						<DrawerClose asChild>
							<Button
								variant="ghost"
								size="icon"
								className="text-gray-400 hover:text-white hover:bg-gray-900"
							>
								<MenuIcon sx={{ fontSize: 30 }} />
							</Button>
						</DrawerClose>
					</div>
					<DrawerHeader className="sr-only">
						<DrawerTitle>サイドバーメニュー</DrawerTitle>
						<DrawerDescription>チャットの履歴と設定</DrawerDescription>
					</DrawerHeader>
					<Link href="/">
						<Button className="w-full justify-start gap-2 bg-gray-900 border-gray-600 text-gray-300 hover:cursor-pointer">
							<EditSquareIcon sx={{ fontSize: 20 }} />
							チャットを新規作成
						</Button>
					</Link>
				</div>

				{/* Recent Section */}
				<div className="flex-1 px-4 py-3 overflow-y-auto">
					<h2 className="text-sm font-medium text-gray-400 mb-3">最近</h2>
					<div className="space-y-1">
						{recentChats.map((chat) => (
							<div
								key={chat}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer group"
							>
								<span className="text-sm text-gray-300 truncate flex-1">
									{chat}
								</span>
							</div>
						))}
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

interface MainContentProps {
	inputValue: string;
	setInputValue: (value: string) => void;
	selectedFile: File | null;
	setSelectedFile: (file: File | null) => void;
	fileInputRef: React.RefObject<HTMLInputElement | null>;
	handleFileUploadAndTextSubmit: (
		text: string,
		file: File | null,
	) => Promise<void>;
}

function MainContent({
	inputValue,
	setInputValue,
	selectedFile,
	setSelectedFile,
	fileInputRef,
	handleFileUploadAndTextSubmit,
}: MainContentProps) {
	return (
		<div className="flex-1 flex flex-col p-5">
			{/* File Upload Section */}
			<div className="mb-4">
				<input
					type="file"
					ref={fileInputRef}
					onChange={(e) =>
						setSelectedFile(e.target.files ? e.target.files[0] : null)
					}
					style={{ display: "none" }}
				/>
			</div>

			{/* Main Chat Area */}
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl text-blue-400 mb-8">
						こんにちは、<span className="text-blue-500">riku</span>
					</h1>
				</div>
			</div>

			{/* Input Area */}
			<div className="p-6">
				<div className="max-w-4xl mx-auto">
					<div className="relative bg-gray-800 rounded-3xl border border-gray-600">
						<Input
							value={inputValue}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setInputValue(e.target.value)
							}
							className="w-full bg-transparent border-none px-6 py-4 text-white  text-base"
						/>

						{/* Action Buttons */}
						<div className="flex items-center justify-between gap-2 px-4 py-2">
							<Button
								variant="ghost"
								size="icon"
								className="text-gray-400 h-8 w-8 hover:bg-gray-800 hover:text-white"
								onClick={() => fileInputRef.current?.click()}
							>
								<AddIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								className="text-gray-400  hover:bg-gray-800 hover:text-white rounded-full"
								onClick={() => {
									handleFileUploadAndTextSubmit(inputValue, selectedFile);
									setInputValue("");
								}}
								disabled={!inputValue && !selectedFile}
							>
								<ArrowCircleRightIcon sx={{ fontSize: 30, color: "skyblue" }} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
