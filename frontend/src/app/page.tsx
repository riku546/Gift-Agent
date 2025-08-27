"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Edit, Plus, CircleArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
	const [inputValue, setInputValue] = useState("");

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
		<div className="flex h-screen bg-gray-900 text-white">
			{/* Sidebar */}

			{/* Header */}
			<div className="p-4  border-gray-700 border-r">
				<div className="flex items-center justify-between mb-4">
					<Button
						variant="ghost"
						size="icon"
						className="text-gray-400 hover:texßt-white hover:bg-gray-900 hover:text-white "
					>
						<Menu className="h-5 w-5" />
					</Button>
				</div>
				<Link href={"/"}>
					<Button className="w-full justify-start gap-2 bg-gray-900 border-gray-600 text-gray-300 hover:cursor-pointer">
						<Edit className="h-4 w-4" />
						チャットを新規作成
					</Button>
				</Link>

				{/* Recent Section */}
				<div className="flex-1 px-4 py-3 overflow-y-auto">
					<h2 className="text-sm font-medium text-gray-400 mb-3">最近</h2>
					<div className="space-y-1">
						{recentChats.map((chat, index) => (
							<div
								key={index}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer group"
							>
								<span className="text-sm text-gray-300 truncate flex-1">
									{chat}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Main Content */}
			<div className="flex-1 flex flex-col p-5">
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
								onChange={(e) => setInputValue(e.target.value)}
								className="w-full bg-transparent border-none px-6 py-4 text-white  text-base"
							/>

							{/* Action Buttons */}
							<div className="flex items-center justify-between gap-2 px-4 py-2">
								<Button
									variant="ghost"
									size="icon"
									className="text-gray-400 h-8 w-8 hover:bg-gray-800 hover:text-white"
								>
									<Plus className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									className="text-gray-400  hover:bg-gray-800 hover:text-white rounded-full"
								>
									<CircleArrowRight className="h-10 w-10" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
