/** @flow */

import Radium from 'radium';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {pushState} from 'redux-react-router';
import _ from 'lodash';
import asap from 'asap';
import {Component, PropTypes} from 'react';

import * as AppActions from './AppActions';
import BlockMessageList from './BlockMessageList';
import Button from './Button';
import Colors from './Colors';
import KeyBinder from './KeyBinder';
import * as LabelActions from './LabelActions';
import LoginModal from './LoginModal';
import Nav from './Nav';
import PureRender from './PureRender';
import Scroller from './Scroller';
import SearchBox from './SearchBox';
import Spinner from './Spinner';
import * as ThreadActions from './ThreadActions';
import {
  hasMoreThreadsSelector,
  isAuthorizedSelector,
  isAuthorizingSelector,
  isLoadingSelector,
  labelsSelector,
  lastMessageInEachThreadSelector,
  loadedThreadCountSelector,
  nextMessageSelector,
  prevMessageSelector,
  searchQuerySelector,
  threadsSelector,
} from './Selectors';

const PAGE_SIZE = 20;

@connect(
  state => ({
    isAuthorized: isAuthorizedSelector(state),
    isAuthorizing: isAuthorizingSelector(state),
    isLoading: isLoadingSelector(state),
    labels: labelsSelector(state),
    searchQuery: searchQuerySelector(state),
    threads: threadsSelector(state),
    lastMessageInEachThread: lastMessageInEachThreadSelector(state),
    hasMoreThreads: hasMoreThreadsSelector(state),
    loadedThreadCount: loadedThreadCountSelector(state),
    nextMessage: nextMessageSelector(state),
    prevMessage: prevMessageSelector(state),
  }),
  dispatch => bindActionCreators({
    loadLabels: LabelActions.loadAll,
    loadThreadList: ThreadActions.loadList,
    refresh: ThreadActions.refresh,
    markAsRead: ThreadActions.markAsRead,
    search: AppActions.search,
    pushState,
  }, dispatch),
)
@KeyBinder
@PureRender
@Radium
class App extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    maxResultCount: PAGE_SIZE,
    queryProgress: null,
  };

  componentWillMount() {
    this._tryLoad(this.props, this.state);
  }

  componentWillUpdate(nextProps, nextState) {
    this._tryLoad(nextProps, nextState);
  }

  componentWillReceiveProps(nextProps) {
    this._tryLoad(nextProps, this.state);
  }

  componentDidMount() {
    this.bindKey('k', this._selectNextMessage);
    this.bindKey('j', this._selectPreviousMessage);
  }

  _tryLoad(props, state) {
    this.props.loadThreadList(props.searchQuery, state.maxResultCount);
  }

  _onRequestMoreItems = () => {
    this.setState({maxResultCount: this.state.maxResultCount + PAGE_SIZE});
  };

  _onMessageSelected = (message: ?Object) => {
    if (message && message.isUnread) {
      this.props.markAsRead(message.threadID);
    }

    if (!message) {
      this.props.pushState(null, '/')
    } else {
      this.props.pushState(null, `/thread/${message.threadID}/message/${message.id}/`);
    }
  };

  _onQueryChange = (query: string) => {
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  };

  _onQuerySubmit = (query: string) => {
    this.props.search(query);
    this.setState({
      queryProgress: query,
      maxResultCount: PAGE_SIZE,
    });
  }

  _selectNextMessage = () => {
    this._onMessageSelected(this.props.nextMessage);
  };

  _selectPreviousMessage = () => {
    this._onMessageSelected(this.props.prevMessage);
  }

  _onRefresh = () => {
    this.props.refresh();
  }

  _onLogoClick = () => {
    window.location.reload();
  }

  render(): any {
    const {hasMoreThreads, loadedThreadCount} = this.props;
    const messages = this.props.lastMessageInEachThread;

    return (
      <div style={styles.app}>
        {this.props.isLoading ? <Spinner /> : null}
        <div style={styles.header}>
          <span onClick={this._onLogoClick} style={styles.logo}>
            &#9993;
            <span style={styles.logoName}>{' '}reflux</span>
          </span>
          <SearchBox
            onQueryChange={this._onQueryChange}
            onQuerySubmit={this._onQuerySubmit}
            query={this.state.queryProgress === null ?
              this.props.searchQuery :
              this.state.queryProgress}
            style={styles.search}
          />
          <Button onClick={this._onRefresh} style={styles.refresh}>
          ⟳
          </Button>
        </div>
        <Nav
          onQueryChanged={this._onQuerySubmit}
          query={this.props.searchQuery}
        />
        <div style={styles.messages}>
          {messages ? (
            <Scroller
              hasMore={hasMoreThreads}
              isScrollContainer={true}
              onRequestMoreItems={this._onRequestMoreItems}
              style={styles.messagesList}>
              <BlockMessageList
                labels={this.props.labels}
                messages={messages}
                onMessageSelected={this._onMessageSelected}
                selectedMessageID={this.props.params.messageID}
              />
              {hasMoreThreads ? (
                <div style={styles.messageLoading}>
                  You{"'"}ve seen {loadedThreadCount}.
                  {loadedThreadCount >= 100 ? (
                    ' ' + _.sample(pagingMessages)
                  ) : null}
                  {' '}Loading more...
                </div>
              ) : null}
            </Scroller>
          ) : (
            <div style={styles.messagesList} />
          )}
          <div style={styles.threadView}>
            {this.props.children && React.cloneElement(
              this.props.children,
              {
                onGoToNextMessage: this._selectNextMessage,
              }
            )}
          </div>
        </div>
        {(!this.props.isAuthorizing && !this.props.isAuthorized) ? (
          <LoginModal />
        ) : null}
      </div>
    );
  }
}

const styles = {
  app: {
    paddingTop: '20px',
  },

  header: {
    display: 'flex',
  },

  logo: {
    color: Colors.accent,
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '32px',
    marginLeft: '12px',
  },

  logoName: {
    marginRight: '12px',
    '@media (max-width: 800px)': {
      display: 'none',
    },
  },

  search: {
    marginLeft: '12px',
  },

  refresh: {
    marginLeft: '12px',
  },

  messages: {
    bottom: 0,
    display: 'flex',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '104px',
  },

  messagesList: {
    flex: 1,
    height: '100%',
    minWidth: '300px',
    maxWidth: '400px',
  },

  threadView: {
    flex: 2,
    height: '100%',
  },

  messageLoading: {
    textAlign: 'center',
    padding: '20px',
  },
};

const pagingMessages = [
  'Still going?',
  'Now you\'re just getting greedy.',
  '\u266b I still haven\'t found what I\'m lookin\' for. \u266b',
  'I could go on forever.',
  'Perhaps you should narrow the search term?',
  'Look at you go!',
  '\u266b This is the song that never ends \u266b',
  '\u266b Scrollin, scrollin, scrollin through the emails \u266b',
  'Really?',
  'Give up, you\'ll never find it now.',
  'I know it must be here somewhere.',
  'You can do it!',
  'Eventually you\'ll just give up.',
  'Dig dig dig!'
];

module.exports = App;
