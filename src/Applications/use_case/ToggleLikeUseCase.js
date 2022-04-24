const Like = require('../../Domains/likes/entities/Like');

class ToggleLikeUseCase {
  constructor({ commentRepository, likeRepository }) {
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    await this._commentRepository.getComment(useCasePayload);

    const like = new Like(useCasePayload);

    try {
      await this._likeRepository.getLike(like);

      await this._likeRepository.deleteLike(like);
    } catch (error) {
      await this._likeRepository.addLike(like);
    }
  }
}

module.exports = ToggleLikeUseCase;

