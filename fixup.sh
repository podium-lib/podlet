#!/usr/bin/env bash

## Append the following to types/podlet.d.ts
cat >> types/podlet.d.ts <<!EOF
declare global {
  namespace Express {
    interface Response {
      podiumSend(fragment: string, ...args: unknown[]): Response;
    }
  }
}
!EOF
