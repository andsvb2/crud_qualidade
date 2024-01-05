interface TodoRepositoryGetParams {
  page: number;
  limit: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (respostaDoServidor) => {
      const todosString = await respostaDoServidor.text();
      const responseParsed = parseTodosFromServer(JSON.parse(todosString));

      return {
        total: responseParsed.total,
        todos: responseParsed.todos,
        pages: responseParsed.pages,
      };
    },
  );
}

export const todoRepository = { get };

interface Todo {
  id: string;
  date: Date;
  content: string;
  done: boolean;
}

function parseTodosFromServer(responseBody: unknown): {
  total: number;
  pages: number;
  todos: Array<Todo>;
} {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    "total" in responseBody &&
    "pages" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null && typeof todo !== "object") {
          throw new Error("Invalid todo from API");
        }

        const { id, date, content, done } = todo as {
          id: string;
          date: string;
          content: string;
          done: string;
        };

        return {
          id,
          date: new Date(date),
          content,
          done: String(done).toLowerCase() === "true",
        };
      }),
    };
  }

  return {
    pages: 1,
    total: 0,
    todos: [],
  };
}
