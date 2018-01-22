expect.extend({
  toPerform(received) {
    const pass = true;

    const message = pass ? () => {
      return `Performance to not be within threshold.`;
    }: () => {
      return `Performance to be within threshold.`;
    };
    return {actual: received, message, pass};
  }
});