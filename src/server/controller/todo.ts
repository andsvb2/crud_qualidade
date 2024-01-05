import { todoRepository } from "@server/repository/todo";
import { NextApiRequest, NextApiResponse } from "next";
import { Schema, z } from "zod";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query;
  const page = Number(query.page);
  const limit = Number(query.limit);

  if (query.page && isNaN(page)) {
    res.status(400).json({
      error: {
        message: "`page` must be a number",
      },
    });
  }

  if (query.limit && isNaN(limit)) {
    res.status(400).json({
      error: {
        message: "`limit` must be a number",
      },
    });
  }

  const output = todoRepository.get({
    page,
    limit,
  });

  res.status(200).json({
    total: output.total,
    todos: output.todos,
    pages: output.pages,
  });
}

const TodoCreateBodySchema = z.object({
  content: z.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
  // Fail Fast Validations
  const body = TodoCreateBodySchema.safeParse(req.body);

  // Type narrowing
  if (!body.success) {
    res.status(400).json({
      error: {
        mesage: "You need to provide a content to create a TODO",
        description: body.error,
      },
    });
    return;
  }

  // Here we have the data!
  const createdTodo = await todoRepository.createByContent(body.data.content);

  res.status(201).json({
    todo: createdTodo,
  });
}

export const todoController = {
  get,
  create,
};
