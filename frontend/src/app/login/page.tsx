"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		user_name: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage(null);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append("user_name", formData.user_name);
			formDataToSend.append("password", formData.password);

			const response = await fetch("http://localhost:8000/login", {
				method: "POST",
				body: formDataToSend,
			});

			if (response.ok) {
				const newUser = await response.json();
				setMessage({
					type: "success",
					text: `アカウントが正常に作成されました！ユーザーID: ${newUser.id}`,
				});
				setFormData({ user_name: "", password: "" });
				router.push("/");
			} else {
				const errorData = await response.json();
				setMessage({
					type: "error",
					text: errorData.detail || "サインアップに失敗しました",
				});
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: "ネットワークエラーが発生しました",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 dark gap-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						ログイン
					</CardTitle>
					<CardDescription className="text-center">
						ログインしてください
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="user_name">ユーザー名</Label>
							<div className="relative">
								<PersonIcon
									sx={{
										position: "absolute",
										left: 8,
										top: 8,
										height: 20,
										width: 20,
										color: "grey",
									}}
								/>
								<Input
									id="user_name"
									name="user_name"
									type="text"
									placeholder="ユーザー名を入力"
									value={formData.user_name}
									onChange={handleInputChange}
									className="pl-10"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">パスワード</Label>
							<div className="relative">
								<LockIcon
									sx={{
										position: "absolute",
										left: 8,
										top: 8,
										height: 20,
										width: 20,
										color: "grey",
									}}
								/>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="パスワードを入力"
									value={formData.password}
									onChange={handleInputChange}
									className="pl-10"
									required
									disabled={isLoading}
								/>
							</div>
						</div>

						{message && (
							<Alert
								className={
									message.type === "error"
										? "border-destructive"
										: "border-green-500"
								}
							>
								{message.type === "success" ? (
									<CheckCircleOutlineIcon
										sx={{ fontSize: 20 }}
										className="h-4 w-4 text-green-500"
									/>
								) : (
									<div className="h-4 w-4 rounded-full bg-destructive" />
								)}
								<AlertDescription
									className={message.type === "success" ? "text-green-600" : ""}
								>
									{message.text}
								</AlertDescription>
							</Alert>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !formData.user_name || !formData.password}
						>
							{isLoading ? (
								<>
									<RestartAltIcon
										sx={{
											mr: 2,
											fontSize: 20,
											animation: "spin 1s linear infinite",
										}}
									/>
									ログイン中...
								</>
							) : (
								"ログイン"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
			<Link className="text-white hover:underline" href="/signup">
				アカウントを作成する
			</Link>
		</div>
	);
}
