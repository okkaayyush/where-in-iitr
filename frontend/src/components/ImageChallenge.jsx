function ImageChallenge({ imageUrl, imageNumber, isCompleted }) {
  return (
    <div className="image-challenge">
      <div className="image-header">
        <h2>Location {imageNumber} of 5</h2>
        {isCompleted && <span className="badge-completed">✓ Completed</span>}
      </div>
      <div className="image-container">
        <img src={imageUrl} alt={`Challenge ${imageNumber}`} />
      </div>
      <p className="hint">Click on the map below to guess the location!</p>
    </div>
  );
}

export default ImageChallenge;