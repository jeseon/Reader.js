import _TTS from '../common/tts/_TTS';

export default class TTS extends _TTS {
  /**
   * @returns {Boolean}
   */
  get makeChunksFinished() { return this._makeChunksFinished; }

  /**
   * @param {Reader} reader
   */
  constructor(reader) {
    super(reader);
    this._makeChunksFinished = false;
    this._chunkSetsForPolling = [];
    this._temporalChunk = null;
  }

  pollChunks() {
    // Polling이 이루어지는 시점에 chunkSet들은 만들어진 순서대로 들어있다.
    // 즉, chunk를 만들기 시작한 (nodeIndex, wordIndex)에 근접한 chunkSet부터 들어있다.
    // (makeAdjacentChunksByNodeLocation 참고)
    const chunkSetsForPolling = this._chunkSetsForPolling;
    this._chunkSetsForPolling = [];
    return JSON.stringify(chunkSetsForPolling);
  }

  pollTemporalChunk() {
    const temporalChunk = this._temporalChunk;
    this._temporalChunk = null;
    return JSON.stringify(temporalChunk);
  }

  /**
   * @param {Boolean} isMakingTemporalChunk
   * @param {Boolean} addAtFirst
   */
  didFinishMakePartialChunks(isMakingTemporalChunk, addAtFirst) {
    if (!isMakingTemporalChunk) {
      this._chunkSetsForPolling.push({
        addAtFirst,
        chunks: this.chunks.map(chunk => chunk.toJSONForNative(this.reader)),
      });
    } else if (this.chunks.length > 0) {
      this._temporalChunk = this.chunks.pop().toJSONForNative(this.reader);
    }
    this._chunks = [];
  }

  didFinishMakeChunks() {
    if (super.didFinishMakeChunks()) {
      this._makeChunksFinished = true;
    }
  }

  flush() {
    super.flush();
    this._makeChunksFinished = false;
    this._chunkSetsForPolling = [];
    this._temporalChunk = null;
  }
}
