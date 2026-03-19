/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log(
      "%cErrorBoundary error:",
      "background-color:red;color:white;",
      error
    );
    console.log(
      "%cErrorBoundary errorInfo:",
      "background-color:red;color:white;",
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props?.customRender ? (
        <>{this.props.customRender}</>
      ) : (
        <div>
          <h1>ERROR</h1>
          <p>Application crashed due to some error. Please try refreshing.</p>
          <br />
          <p>If you are developer, please see the logs for more details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
