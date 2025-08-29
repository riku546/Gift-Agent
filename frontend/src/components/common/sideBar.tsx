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
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import ErrorIcon from "@mui/icons-material/Error";

export default function Sidebar() {
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [userInfo, setUserInfo] = useState<{
		id: string;
		name: string;
	} | null>(null);

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const response = await fetch("http://localhost:8000/user", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						session_token: localStorage.getItem("session_token") || "",
					},
				});
				const data = await response.json();

				setUserInfo({
					id: data.id,
					name: data.name,
				});
			} catch {
				setUserInfo(null);
			}
		};

		fetchUserInfo();
	}, []);

	const recentChats = [
		"サンプル１",
		"サンプル２",
		"サンプル３",
		"サンプル４",
		"サンプル５",
		"サンプル６",
		"サンプル７",
		"サンプル８",
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
				<div className="flex-1 p-4 overflow-y-auto">
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

				<div className="h-20 p-4">
					{userInfo === null ? (
						<div className="flex items-center  gap-4">
							<ErrorIcon className="text-red-500" />
							<Link className="text-gray-300" href={"/login"}>
								ログインしてください
							</Link>
						</div>
					) : (
						<div className="flex items-center p-4 gap-2">
							<PersonIcon sx={{ fontSize: 30, color: "gray" }} />
							<div className="text-gray-300">{userInfo.name}</div>
						</div>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
