// source data
export interface Community {
  id: string;
  [key: string]: unknown;
}
export interface Node extends Community {
  clusterId: string;
}
export interface HeadCluster extends Community {
  nodes: string[];
  edgeNum: number;
}
export interface Cluster extends Node, HeadCluster { }
export interface Edge {
  source: string;
  target: string;
  [key: string]: unknown;
}
export interface ClusterEdge extends Edge {
  count: number;
}
export type Layer<T extends Node | HeadCluster> = {
  nodes: T[];
  edges: (T extends HeadCluster ? ClusterEdge : Edge)[];
}
export interface LayerNetwork {
  [index: number]: Layer<Cluster | Node>;
}