"use client";

import Sidebar from "@/components/common/sideBar";
import InputComponent from "@/components/common/input";

export default function Home() {
	return (
		<div className="flex h-screen bg-gray-900 text-white p-5">
			<Sidebar />
			<MainContent inputComponent={<InputComponent />} />
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
					<h1 className="text-2xl text-blue-400 mb-8">
						こんにちは、<span className="text-blue-500">riku</span>
					</h1>
				</div>
			</div>
			{inputComponent}
		</div>
	);
};
