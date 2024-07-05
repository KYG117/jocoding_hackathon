import { History } from '../Contexts';
import Tree from 'react-d3-tree';

const HistoryView = ({ history }: { history: History }) => {
  return (
    <div className='historyView'>
      <div className='historyTree' style={{width: '50em', height: '20em'}}>
        <Tree data={history.tree} orientation='vertical' />
      </div>
    </div>
  );
}

export default HistoryView;