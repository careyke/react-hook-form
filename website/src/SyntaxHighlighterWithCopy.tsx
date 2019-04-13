// @flow
import React from 'react';
import styled from 'styled-components';
import copyClipBoard from './utils/copyClipBoard';
import generateCode from './logic/generateCode';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import colors from './styles/colors';

const CopyButton = styled.button`
  background: ${colors.lightBlue};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  position: absolute;
  right: 0;
  top: 10px;
  box-shadow: 0 0 10px #000;
  display: none;

  @media (min-width: 768px) {
    display: inline-block;
  }
  
  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

const LinkToSandBox = styled.a`
  background: ${colors.lightPink};
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  padding: 5px 10px;
  position: absolute;
  top: 10px;
  right: 0;
  box-shadow: 0 0 10px #000;
  text-decoration: none;

  @media (min-width: 768px) {
    display: inline-block;
    right: 170px;
  }
  
  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: translateY(2px);
  }
`;

export default function SyntaxHighlighterWithCopy({ rawData, data, url }: { rawData?: string; data?: string, url?: string }) {
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <CopyButton
        onClick={() => {
          rawData || copyClipBoard(generateCode(data));
        }}
      >
        Copy to clipboard
      </CopyButton>

      {url && <LinkToSandBox href={url} target="_blank">CodeSandbox</LinkToSandBox>}
      <SyntaxHighlighter style={monokaiSublime}>{rawData || generateCode(data)}</SyntaxHighlighter>
    </div>
  );
}
