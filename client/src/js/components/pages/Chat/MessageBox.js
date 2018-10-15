import React, { PureComponent } from 'react';
import { List } from 'react-virtualized/dist/commonjs/List';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import debounce from 'lodash/debounce';
import { getScrollPos, saveScrollPos } from 'utils/scrollPosition';
import Message from './Message';

const fetchThreshold = 600;
// The amount of time in ms that needs to pass without any
// scroll events happening before adding messages to the top,
// this is done to prevent the scroll from jumping all over the place
const scrollbackDebounce = 100;

export default class MessageBox extends PureComponent {
  componentWillMount() {
    this.loadScrollPos();
  }

  componentDidMount() {
    this.mounted = true;
    this.scrollTop = -1;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.messages !== this.props.messages) {
      this.list.recomputeRowHeights();
    }

    if (nextProps.tab !== this.props.tab) {
      this.saveScrollPos();
      this.bottom = false;
    }

    if (nextProps.messages[0] !== this.props.messages[0]) {
      if (nextProps.tab === this.props.tab) {
        const addedMessages =
          nextProps.messages.length - this.props.messages.length;
        let addedHeight = 0;
        for (let i = 0; i < addedMessages; i++) {
          addedHeight += nextProps.messages[i].height;
        }

        this.nextScrollTop = addedHeight + this.container.scrollTop;
      }

      this.loading = false;
      this.ready = false;
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tab !== this.props.tab) {
      this.loadScrollPos(true);
    }

    if (this.nextScrollTop > 0) {
      this.container.scrollTop = this.nextScrollTop;
      this.nextScrollTop = 0;
    } else if (this.bottom) {
      this.list.scrollToRow(this.props.messages.length);
    }
  }

  componentWillUnmount() {
    this.saveScrollPos();
  }

  getRowHeight = ({ index }) => {
    if (index === 0) {
      if (this.props.hasMoreMessages) {
        return 100;
      }
      return 0;
    }
    return this.props.messages[index - 1].height;
  };

  listRef = el => {
    this.list = el;
    if (el) {
      // eslint-disable-next-line no-underscore-dangle
      this.container = el.Grid._scrollingContainer;
    }
  };

  updateScrollKey = () => {
    const { tab } = this.props;
    this.scrollKey = `msg:${tab.server}:${tab.name}`;
    return this.scrollKey;
  };

  loadScrollPos = scroll => {
    const pos = getScrollPos(this.updateScrollKey());
    if (pos >= 0) {
      this.bottom = false;
      if (scroll) {
        this.list.scrollToPosition(pos);
      } else {
        this.scrollTop = pos;
      }
    } else {
      this.bottom = true;
      if (scroll) {
        this.list.scrollToRow(this.props.messages.length);
      }
    }
  };

  saveScrollPos = () => {
    if (this.bottom) {
      saveScrollPos(this.scrollKey, -1);
    } else {
      saveScrollPos(this.scrollKey, this.container.scrollTop);
    }
  };

  fetchMore = () => {
    this.loading = true;
    this.props.onFetchMore();
  };

  addMore = debounce(() => {
    const { tab, onAddMore } = this.props;
    this.ready = true;
    onAddMore(tab.server, tab.name);
  }, scrollbackDebounce);

  handleScroll = ({ scrollTop, clientHeight, scrollHeight }) => {
    if (this.mounted) {
      if (
        !this.loading &&
        this.props.hasMoreMessages &&
        scrollTop <= fetchThreshold &&
        scrollTop < this.prevScrollTop
      ) {
        this.fetchMore();
      }

      if (this.loading && !this.ready) {
        if (this.mouseDown) {
          this.ready = true;
          this.shouldAdd = true;
        } else {
          this.addMore();
        }
      }

      this.bottom = scrollTop + clientHeight >= scrollHeight - 10;
      this.prevScrollTop = scrollTop;
    }
  };

  handleMouseDown = () => {
    this.mouseDown = true;
  };

  handleMouseUp = () => {
    this.mouseDown = false;

    if (this.shouldAdd) {
      const { tab, onAddMore } = this.props;
      this.shouldAdd = false;
      onAddMore(tab.server, tab.name);
    }
  };

  renderMessage = ({ index, style }) => {
    if (index === 0) {
      if (this.props.hasMoreMessages) {
        return (
          <div key="top" className="messagebox-top-indicator" style={style}>
            Loading messages...
          </div>
        );
      }
      return null;
    }

    const { messages, coloredNicks, onNickClick } = this.props;
    const message = messages[index - 1];

    return (
      <Message
        key={message.id}
        message={message}
        coloredNick={coloredNicks}
        style={style}
        onNickClick={onNickClick}
      />
    );
  };

  render() {
    const props = {};
    if (this.bottom) {
      props.scrollToIndex = this.props.messages.length;
    } else if (this.scrollTop >= 0) {
      props.scrollTop = this.scrollTop;
    }

    return (
      <div
        className="messagebox"
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={this.listRef}
              width={width}
              height={height - 14}
              rowCount={this.props.messages.length + 1}
              rowHeight={this.getRowHeight}
              rowRenderer={this.renderMessage}
              onScroll={this.handleScroll}
              className="rvlist-messages"
              {...props}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
