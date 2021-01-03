import { Request, Response } from 'express';
import Task from 'src/model/Task';
import { retrieveTaskList } from 'src/service/task';


export const retrieve = async (req: Request, res: Response, next: (error: Error) => any) => {
  try {
    const list = await retrieveTaskList();
    res.json({
      msg: 'homepage',
      list,
    });
  } catch (error) {
    next(error);
  }
}

export const create = async (req: Request, res: Response, next: (error: Error) => any) => {
  try {
    const { body } = req;
    // TODO:
    // const newDataSource = new Task({
    //   name: body.name,
    //   url: body.url,
    //   node: {
    //     total: 0,
    //     current: 0,
    //     param: body.nodeParam.split(','),
    //   },
    //   edge: {
    //     total: 0,
    //     current: 0,
    //     param: body.edgeParam.split(','),
    //   },
    //   scale: body.scale,
    //   needExpand: body.needExpand,
    //   expandSource: body.expandSource,
    // });
    // await newDataSource.save();
    res.json({ message: 'success' });
  } catch (error) {

  }
}