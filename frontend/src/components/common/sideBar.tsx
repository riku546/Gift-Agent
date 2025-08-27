"use client";

import { Button } from "@/components/ui/button";
import MenuIcon from "@mui/icons-material/Menu";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import Link from "next/link";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";

export default function Sidebar() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
					<a href="http://localhost:3000">
						<Button className="w-full justify-start gap-2 bg-gray-900 border-gray-600 text-gray-300 hover:cursor-pointer">
							<EditSquareIcon sx={{ fontSize: 20 }} />
							チャットを新規作成
						</Button>
					</a>
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
