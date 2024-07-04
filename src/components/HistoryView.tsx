import React from 'react';
import { HistoryNode, History } from "../Contexts";

const HistoryView: React.FC<{ history: History | null }> = ({ history }) => {
  const renderNode = (node: HistoryNode) => {
    if(history === null) return <></>;
    return (
      <div key={node.id}>
        <div>Node ID: {node.id}</div>
        <div>Page: {node.page.sentences[0].join(" ") + "."}</div>
        <div>Selection: {node.selection}</div>
        <hr />
        {node.children.map(childId => {
          const childNode = history.nodes.find(node => node.id === childId);
          if (childNode) {
            return renderNode(childNode);
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div>
      <h1>History View</h1>
      {history?.nodes.map(node => {
        if (node.parentId === 0) {
          return renderNode(node);
        }
        return null;
      })}
    </div>
  );
};

export default HistoryView;