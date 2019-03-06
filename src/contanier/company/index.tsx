import React from "react";
import { Button } from "antd-mobile";
const Index: React.SFC = () => {
  React.useEffect(() => {
    document.title = "公司简介";
  });
  return (
    <>
      <Button type="primary" inline size="small" style={{ marginRight: "4px" }}>
        primary
      </Button>
    </>
  );
};

export default Index;
