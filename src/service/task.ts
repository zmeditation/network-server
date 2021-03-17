import { findCrossLayerEdges, saveEdges, saveLayer } from 'src/service/Network';
import Task from 'src/model/Task';
import { testClusterNetwork } from 'src/util/testCluster';
import { retrieveCompleteSourceNetwork } from './network';
import { objectId2String, string2ObjectId } from 'src/util/string';
import { cronDebug } from 'src/util/debug';

export const retrieveTaskList = async () => {
  const list = await Task.find().exec();
  return list;
}

export const retrieveOneTask = async (taskId: string) => {
  const aggregate = Task.aggregate([{
    $match: {
      _id: string2ObjectId(taskId),
    }
  }]);
  const tasks = await aggregate.lookup({
    from: 'datasources',
    localField: 'dataSourceId',
    foreignField: '_id',
    as: 'dataSource'
  }).exec();
  return tasks[0];
};

export const retrieveTaskWithDataSourceList = async () => {
  const aggregate = Task.aggregate();
  const list = await aggregate.lookup({
    from: 'datasources',
    localField: 'dataSourceId',
    foreignField: '_id',
    as: 'dataSource'
  }).exec();
  return list;
}

export const updateTask = async (task: any, newProperties: object) => {
  const { _id } = task;
  await Task.findByIdAndUpdate(_id, newProperties);
}

export const handleTask = async (task: any) => {
  const { dataSource, _id } = task;
  const taskId = objectId2String(_id);
  const { name } = dataSource[0];
  cronDebug(`Handle Task [${name}:${taskId}] Start`);
  // 1. get source network data
  const layer = await retrieveCompleteSourceNetwork(name);
  // 2. n-cluster network
  const layerNetwork = testClusterNetwork(layer, 3);
  // 3. data process(add taskId for cluster)
  const completeLayerNetwork = [];
  for (let index = 1; index < layerNetwork.length; index++) {
    const layer = layerNetwork[index];
    const { nodes, edges } = layer;
    const layerWithTaskId = {
      nodes: nodes.map(node => ({ ...node, taskId })),
      edges: edges.map(edge => ({ ...edge, taskId })),
    };
    completeLayerNetwork.push(layerWithTaskId);
  }
  // 4. save layer network to neo4j
  for (let i = 0; i < completeLayerNetwork.length; i += 1) {
    const layer = completeLayerNetwork[i];
    await saveLayer(layer, name);
  }
  // 5. create edge from 
  const crossLayerEdges = findCrossLayerEdges(layerNetwork);
  const includeEdgeLabel = `${name}_include`;
  await saveEdges(crossLayerEdges, name, includeEdgeLabel);
  // 6. update task info
  await updateTask(task, {
    progress: 100,
    largestLevel: layerNetwork.length - 1,
  });
}
