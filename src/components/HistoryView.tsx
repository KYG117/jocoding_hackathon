import { useState, useCallback } from 'react';
import { History, HistoryNode } from '../Contexts';
import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  DefaultEdgeOptions,
  NodeTypes
} from 'reactflow';

const toNode = (historyNode: HistoryNode) => {
  return {
    id: historyNode.id.toString(),
    data: { label: historyNode.selection },
    position: { x: 0, y: 0 }
  }
}

const getEdges = (history: History) => {
  const edges: Edge[] = [];
  history.nodes.forEach((node) => {
    node.children.forEach((child) => {
      edges.push({ id: `${node.id}-${child}`, source: node.id.toString(), target: child.toString() });
    });
  });
  return edges;
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: false
}

const nodeTypes: NodeTypes = {
  default: ({ data }) => <div>{data.label}</div>
}

const HistoryView = ({ history }: { history: History }) => {
  const [nodes, setNodes] = useState<Node[]>(history.nodes.map((node) => toNode(node)));
  const [edges, setEdges] = useState<Edge[]>(getEdges(history));

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
      nodeTypes={nodeTypes}
    />
  );
}

export default HistoryView;