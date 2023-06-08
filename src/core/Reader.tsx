import { toArrayBuffer } from '@kitware/vtk.js/Common/Core/Base64.js';
import { vtkAlgorithm, vtkObject } from '@kitware/vtk.js/interfaces';
import vtk from '@kitware/vtk.js/vtk';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { VtkConstructor } from '../types';
import deletionRegistry from '../utils/DeletionRegistry';
import { useDownstream, useRepresentation } from './contexts';

export interface ReaderProps extends PropsWithChildren {
  /**
   * Can either be a string containing the name of the vtkClass or a vtk object constructor.
   *
   * If a string, then that vtk class must be registered (i.e. by import).
   */
  vtkClass: string | VtkConstructor;

  /**
   * An optional port number for connections.
   */
  port?: number;

  /**
   * Download data from a URL.
   *
   * Must be CORS-accessible.
   *
   * This option is for convenience. If you want more fine-grained
   * control over fetching (i.e. aborting, options, etc.) then it
   * is advisable to fetch the data yourself and pass it into the
   * reader via `arrayBuffer`, `base64ArrayBuffer`, or `text`.
   */
  url?: string;

  /**
   * An object of options passed to the reader's setUrl() function.
   *
   * See the reader's docs for more details.
   */
  urlOptions?: object;

  /**
   * ArrayBuffer containing data to parse.
   */
  arrayBuffer?: ArrayBuffer;
  /**
   * ArrayBuffer containing data to parse, in a base64 string.
   */
  base64ArrayBuffer?: string;
  /**
   * Textual representation of the data.
   */
  text?: string;
}

interface vtkReader extends vtkAlgorithm, vtkObject {
  setUrl(url: string, options?: object): Promise<void>;
  parseAsArrayBuffer(ab: ArrayBuffer): void;
  parseAsText(text: string): void;
}

/**
 * Reads data and produces vtkObjects.
 */
export default function Reader(props: ReaderProps) {
  const { vtkClass, url, urlOptions, arrayBuffer, base64ArrayBuffer, text } =
    props;

  if ([url, arrayBuffer, base64ArrayBuffer, text].filter(Boolean).length > 1) {
    console.warn(
      '<Reader>: multiple data options provided. Please only provide one.'
    );
  }

  const representation = useRepresentation();

  const createReader = useCallback(() => {
    if (typeof vtkClass === 'string') {
      return vtk({ vtkClass }) as vtkReader;
    }
    return vtkClass.newInstance() as vtkReader;
  }, [vtkClass]);

  // --- reader creation --- //

  const readerRef = useRef<vtkReader | null>(null);

  useEffect(() => {
    const reader = createReader();
    deletionRegistry.register(reader, () => reader.delete());
    readerRef.current = reader;
    return () => {
      representation.dataAvailable(false);
      deletionRegistry.markForDeletion(reader);
    };
  }, [createReader, representation]);

  // --- url handling --- //

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !url) return;

    reader.setUrl(url, urlOptions).then(() => {
      if (reader.isDeleted()) return;
      representation.dataAvailable();
    });
  }, [url, urlOptions, representation]);

  // --- arrayBuffer --- //

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !arrayBuffer) return;

    reader.parseAsArrayBuffer(arrayBuffer);
    representation.dataAvailable();
  }, [arrayBuffer, representation]);

  // --- base64 string of ArrayBuffer --- //

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !base64ArrayBuffer) return;

    reader.parseAsArrayBuffer(toArrayBuffer(base64ArrayBuffer));
    representation.dataAvailable();
  }, [base64ArrayBuffer, representation]);

  // --- text --- //

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader || !text) return;

    reader.parseAsText(text);
    representation.dataAvailable();
  }, [text, representation]);

  // --- downstream registration --- //

  const downstream = useDownstream();
  const { port } = props;

  useEffect(() => {
    const reader = readerRef.current;
    if (!reader) return;

    downstream.setInputConnection(reader.getOutputPort(), port);
  });
}
