"use client";

import { useState } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddIcon from "@mui/icons-material/Add";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

export default function InputComponent() {
	const [inputValue, setInputValue] = useState("");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUploadAndTextSubmit = async (
		text: string,
		file: File | null,
	) => {
		if (!text) {
			console.warn("テキストが入力されていません。");
			return;
		}

		const formData = new FormData();

		formData.append("user_input", text);
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
			console.log(result)
			
			alert("ファイルとテキストが正常にアップロードされました！");
		} catch (error) {
			console.error("Error uploading file and text:", error);
			alert("ファイルのアップロード中にエラーが発生しました。");
		} finally {
			setInputValue("");
			setSelectedFile(null);
		}
	};

	return (
		<div>
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
