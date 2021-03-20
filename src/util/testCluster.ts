import { Network, LayerNetwork } from "src/type/network";
import labelPropagation from 'src/algorithm/label-propagation';

/**
 * 
 * @param layer source nodes and edges
 * @param depth target cluster depth, >= 1
 */
export const testClusterNetwork = (
  layer: Network,
  depth: number,
): LayerNetwork => {
  const layerNetwork = [];
  let currentDepth = 1, currentLayer: Network = layer;
  do {
    layerNetwork.push(currentLayer);
    currentLayer = testClusterLayer(currentLayer, currentDepth);
  } while (currentDepth++ < depth);
  return layerNetwork;
}

export const testClusterLayer = (layer: Network, depth: number = 1): Network => {
  const targetLevel = layer.nodes.length ? layer.nodes[0].level + 1 : 0;
  const lpaResult = labelPropagation(
    layer,
    true,
    undefined,
    undefined,
    (_, i) => `${depth}_${i}`,
  );
  const clusterResult: Network = {
    nodes: [],
    edges: [],
  };
  const { clusters, clusterEdges } = lpaResult;
  clusters.forEach(cluster => {
    const nodes = cluster.nodes.map(node => node.id);
    clusterResult.nodes.push({
      id: cluster.id,
      nodes,
      level: targetLevel,
      features: [
        'sex male 80%',
        'age old 50%',
        'name shang 10%',
      ],
      count: cluster.count,
    });
  });

  clusterEdges.forEach(edge => {
    if (edge.source === edge.target) return;
    clusterResult.edges.push({
      source: edge.source,
      target: edge.target,
      count: 0,
    });
  });
  return clusterResult;
}
