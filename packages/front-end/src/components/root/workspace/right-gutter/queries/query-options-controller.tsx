import * as React from "react";
import { Dispatch } from "redux";
import * as cx from "classnames";
import { BaseQueryOptionsProps } from "./view.pc";
import { PCQueryType, PCQuery } from "paperclip";
import { QUERY_DROPDOWN_OPTIONS } from "./utils";
import { queryTypeChanged } from "../../../../../actions";

export type Props = {
  query: PCQuery;
  dispatch: Dispatch<any>;
};

export default (Base: React.ComponentClass<BaseQueryOptionsProps>) =>
  class QueryOptionsController extends React.PureComponent<Props> {
    onTypeChange = (value: PCQueryType) => {
      this.props.dispatch(queryTypeChanged(this.props.query, value));
    };
    render() {
      const { onTypeChange } = this;
      const { query, ...rest } = this.props;
      return (
        <Base
          {...rest}
          variant={cx({
            media: query.type === PCQueryType.MEDIA,
            variable: query.type === PCQueryType.VARIABLE
          })}
          typeInputProps={{
            value: query.type,
            onChangeComplete: onTypeChange,
            options: QUERY_DROPDOWN_OPTIONS
          }}
        />
      );
    }
  };
