// test cases for finding content in asm lists
// verifies our functions for finding doginal content in a scriptSig
// work properly
import { findContent } from '../find-content'; // Adjust the import to your actual module path

// Example asm arrays for different test cases
const asm1 = [
  '6582895',
  '1',
  '746578742f706c61696e3b636861727365743d7574662d38',
  '0',
  '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d',
  '3045022100e4dc2aa0c8c491259b053282df374a0277532d22cf1130efbe631998469758ba02207e77aba12bcb94f9f990ab2f9dddb812c5b6e0f3ae6ad4ab5d390f0bb62d8476[ALL]',
  '21032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551',
];

const asm2 = [
  '6582895',
  '1',
  '746578742f706c61696e3b636861727365743d7574662d38',
  '0',
  '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
  '304402201294bf19ad7283abf6573008e5e70f1b13c26647c49644d1717f0ceb8ed1cb3202207454cd4f65d3de0d672aa17c7e62726532dd99382514b93da2bc0bc7f38a2636[ALL]',
  '21032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551',
];

const asm3 = [
  '6582895',
  '1',
  '746578742f706c61696e3b636861727365743d7574662d38',
  '2',
  '0xff',
  '0',
  '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
  '304402201294bf19ad7283abf6573008e5e70f1b13c26647c49644d1717f0ceb8ed1cb3202207454cd4f65d3de0d672aa17c7e62726532dd99382514b93da2bc0bc7f38a2636[ALL]',
  '21032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551',
];

const asm4 = [
  '6582895',
  '1',
  '746578742f706c61696e3b636861727365743d7574662d38',
  'GARBAGE',
  '2',
  '0xff',
  'JUNK',
  '0',
  '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
  '304402201294bf19ad7283abf6573008e5e70f1b13c26647c49644d1717f0ceb8ed1cb3202207454cd4f65d3de0d672aa17c7e62726532dd99382514b93da2bc0bc7f38a2636[ALL]',
  '21032d7d9fa168a9194f04f8bdc66051136bfcc895bf6849e9cf9c6c040fdc1fcc93ad757575757551',
];

describe('findContent', () => {
  it('should find the content in asm1', () => {
    const { content, contentType, hasPointer, pointer } = findContent(asm1);
    expect(content).toBe(
      '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a2274666c6e222c22616d74223a223530227d',
    );

    expect(contentType).toBe(
      '746578742f706c61696e3b636861727365743d7574662d38',
    );
    expect(hasPointer).toBe(false);
    expect(pointer).toBe('');
  });

  it('should find the content & content type in asm2', () => {
    const { content, contentType, hasPointer, pointer } = findContent(asm2);
    expect(content).toBe(
      '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
    );

    expect(contentType).toBe(
      '746578742f706c61696e3b636861727365743d7574662d38',
    );
    expect(hasPointer).toBe(false);
    expect(pointer).toBe('');
  });

  it('should handle pointers and find the correct content in asm3', () => {
    const { content, contentType, hasPointer, pointer } = findContent(asm3);
    expect(content).toBe(
      '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
    );

    expect(contentType).toBe(
      '746578742f706c61696e3b636861727365743d7574662d38',
    );
    expect(hasPointer).toBe(true);
    expect(pointer).toBe('0xff');
  });

  it('should be able to find the content even with garbage in the asm', () => {
    const { content, contentType, hasPointer, pointer } = findContent(asm4);
    expect(content).toBe(
      '7b2270223a226472632d3230222c226f70223a227472616e73666572222c227469636b223a226561727a222c22616d74223a2231303030227d',
    );

    expect(contentType).toBe(
      '746578742f706c61696e3b636861727365743d7574662d38',
    );
    expect(hasPointer).toBe(true);
    expect(pointer).toBe('0xff');
  });
});
