"use client";

import { useEffect, useState } from "react";

interface Todo {
	id: number;
	title: string;
	created_date: string;
}

export default function Home() {
	const [todos, setTodos] = useState<Todo[]>([]);

	useEffect(() => {
		fetch("http://localhost:8000/todo")
			.then((res) => res.json())
			.then((data) => setTodos(data))
			.catch((error) => console.error("Error fetching todos:", error));
	}, []);

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
	
				<h1 className="text-4xl font-bold">ToDoリスト</h1>
				<ul className="list-disc pl-5">
					{todos.map((todo) => (
						<li key={todo.id} className="text-lg">
							{todo.title}
						</li>
					))}
				</ul>
			</main>
		</div>
	);
}
