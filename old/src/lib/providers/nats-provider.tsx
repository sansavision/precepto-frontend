import {
  type NatsConnection,
  type RequestOptions,
  StringCodec,
  type Subscription,
  connect,
  type PublishOptions
} from 'nats.ws';

// src/nats/NatsProvider.tsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface NatsContextType {
  natsConnection: NatsConnection | null;
  isConnected: boolean;
  connectionError: string | null;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  publish: (subject: string, data: Uint8Array | string, options?: any) => void;

  subscribe: (
    subject: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    callback: (msg: any) => void,
  ) => Subscription | null;
  request: (
    subject: string,
    data: Uint8Array | string,
    options?: RequestOptions,
  ) => Promise<string>;
}

const NatsContext = createContext<NatsContextType>({
  natsConnection: null,
  isConnected: false,
  connectionError: null,
  publish: () => { },
  subscribe: () => null,
  request: async () => '',
});

interface NatsProviderProps {
  children: React.ReactNode;
}

// const natsConnection = useRef<NatsConnection | null>(null);
export const NatsProvider: React.FC<NatsProviderProps> = ({ children }) => {
  const natsConnection = useRef<NatsConnection>();
  // const [natsConnection, setNatsConnection] = useState<NatsConnection | null>(
  //   null,
  // );
  // const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const sc = StringCodec();


  const connectToNats = useCallback(async () => {

    try {
      const nc = await connect({
        servers: [
          'wss://nats1.sansadev.com:9222',
          'wss://nats2.sansadev.com:9223',
          'wss://nats3.sansadev.com:9224',
        ],
        reconnect: true,
        // debug: true,
        verbose: true,
      });
      // setNatsConnection(nc);
      natsConnection.current = nc;

      // setIsConnected(true);
      console.info('Connected to NATS');

      // Handle disconnects

      (async () => {
        if (natsConnection.current) {
          for await (const status of natsConnection.current.status()) {
            console.info('NATS status:', status);
            if (status.type === 'disconnect') {
              // setIsConnected(false);
              console.warn('Disconnected from NATS');
            } else if (status.type === 'reconnect') {
              // setIsConnected(true);
              console.info('Reconnected to NATS');
            }
          }
        }
      })();
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      setConnectionError('Failed to connect to server.');
    }
  }, []);
  useEffect(() => {
    // let nc: NatsConnection;
    connectToNats();

    return () => {
      natsConnection.current?.close();
    };
  }, [connectToNats]);

  const publish = (
    subject: string,
    data: Uint8Array | string,
    options?: PublishOptions,
  ) => {
    if (!natsConnection.current) { return; }
    const payload = typeof data === 'string' ? sc.encode(data) : data;
    natsConnection.current.publish(subject, payload, options);
  };
  // const publish = (
  //   subject: string,
  //   data: Uint8Array | string,
  //   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  //   options?: any,
  // ) => {
  //   if (!natsConnection) {return;}
  //   const payload = typeof data === 'string' ? sc.encode(data) : data;
  //   natsConnection.publish(subject, payload, options);
  // };

  const subscribe = (
    subject: string,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    callback: (msg: any) => void,
  ): Subscription | null => {
    if (!natsConnection.current) { return null; }
    const sub = natsConnection.current.subscribe(subject);
    (async () => {
      for await (const msg of sub) {
        callback(msg);
      }
    })();
    return sub;
  };

  const request = async (
    subject: string,
    data: Uint8Array | string,
    options?: RequestOptions,
  ): Promise<string> => {
    console.info("natsConnection.current in request", natsConnection.current)
    console.info("natsConnection.current.isclosed in request", natsConnection.current?.isClosed())
    if (!natsConnection.current) { throw new Error('NATS connection not established'); }
    const payload = typeof data === 'string' ? sc.encode(data) : data;
    const msg = await natsConnection.current.request(subject, payload, options);
    return sc.decode(msg.data);
  };

  return (
    <NatsContext.Provider
      value={{
        natsConnection: natsConnection.current || null,
        isConnected: !natsConnection.current?.isClosed(),
        connectionError,
        publish,
        subscribe,
        request,
      }}
    >
      {children}
    </NatsContext.Provider>
  );
};

export const useNats = () => useContext(NatsContext);
