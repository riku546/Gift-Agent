"use client";

import Sidebar from "@/components/common/sideBar";
import InputComponent from "@/components/common/input";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
export default function Home() {
	const router = useRouter();
	const handleClick = async (userInput: string, textFile: File | null) => {
		localStorage.setItem("user_input", userInput);
		if (textFile) {
			const textData = await textFile.text();
			localStorage.setItem("text_file", textData);
		}

		const uuid = uuidv4();

		router.push(`/chat/${uuid}`);
	};
	return (
		<div className="flex h-screen bg-gray-900 text-white p-5">
			<Sidebar />
			<MainContent
				inputComponent={<InputComponent handleClick={handleClick} />}
			/>
		</div>
	);
}

const MainContent = ({
	inputComponent,
}: {
	inputComponent: React.ReactNode;
}) => {
	return (
		<div className="flex-1 flex flex-col p-5">
			{/* Main Chat Area */}
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-4xl text-blue-400 mb-8">Gift Agent</h1>
				</div>
			</div>
			{inputComponent}
		</div>
	);
};
