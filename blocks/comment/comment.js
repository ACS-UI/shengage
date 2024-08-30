/* eslint-disable no-use-before-define */
/*
 * Reaction Block
 * Collects the user's reaction
 */
import { htmlToElement, apiRequest, getAuthoredData } from '../../scripts/scripts.js';
import { isSignedInUser, getUserData, addTooltips } from '../../scripts/auth.js';

let userDetails;
let commentsSectionDiv;
let currentOpenReplyForm = null;
let isSignedIn = false;
let config = {};
const isMobile = window.matchMedia('(max-width: 600px)').matches;

/**
 * Fetches comment data from the server.
 * @returns {Promise<Object|null>} - The fetched comment data or null if an error occurs.
 */
const getCommentData = async () => {
  const endpoint = '/getComments';
  const storyId = document.querySelector('meta[name="storyid"]')?.content;
  const requestData = { storyId };
  // Include userId in request if available
  if (userDetails?.id) {
    requestData.userId = userDetails.id;
  }
  try {
    const response = await apiRequest({
      method: 'POST',
      endpoint,
      data: requestData,
    });

    return response.data ?? null;
  } catch (error) {
    console.error('Error fetching comment data:', error);
    return null;
  }
};

/**
 * Prepares a new comment object with an appropriate ID and timestamp.
 * @param {Array} comments - The array of comments, including nested replies.
 * @param {string} parentId - The ID of the parent comment.
 * @param {string} commentText - The text of the new comment.
 * @param {number} [currentLevel=0] - The current level of the comment (default is 0).
 * @returns {Object} - The prepared new comment object.
 */
const prepareComment = async (comments, parentId, commentText, currentLevel = 0) => {
  const parentComment = await getCommentById(comments, parentId);
  const maxId = parentComment?.replies ? getMaxCommentId(parentComment.replies) : '0';

  const newId = maxId !== '0'
    ? `${parentId}.${parseInt(maxId.split('.').pop(), 10) + 1}`
    : `${parentId}.1`;

  const commentId = currentLevel === 0
    ? (parseInt(parentId, 10) + 1).toString()
    : newId;

  return {
    storyId: config.storyId,
    commentId,
    commentText,
    postedBy: userDetails,
    postedDate: getIndianTimestamp(),
  };
};

/**
 * Posts a comment to the server.
 * @param {Object} comment - The comment object to be posted.
 * @returns {Promise<Object|null>} - The response data from the server or null in case of an error.
 */
const postComment = async (comment) => {
  const endpoint = '/postComment';

  try {
    const response = await apiRequest({
      method: 'POST',
      endpoint,
      data: comment,
    });

    return response.data ?? null;
  } catch (error) {
    console.error('Error posting comment:', error);
    return null;
  }
};

/**
 * Gets the current timestamp adjusted to Indian Standard Time (IST).
 * @returns {Date} - A Date object representing the current time in IST.
 */
const getIndianTimestamp = () => {
  const now = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
  return new Date(now.getTime() + IST_OFFSET);
};

/**
 * Recursively retrieves a comment by its ID from a nested array of comments.
 * @param {Array} data - The array of comments, which may contain nested replies.
 * @param {string} parentId - The ID of the comment to find.
 * @returns {Object|null} - The comment with the specified ID, or null if not found.
 */
async function getCommentById(data, parentId) {
  // Recursive function to search for a comment
  const findComment = (comments, id) => {
    // Direct match check
    const match = comments.find((comment) => comment.commentId === id);
    if (match) return match;

    // Recursively search in nested replies
    return comments
      .filter((comment) => comment.replies)
      .map((comment) => findComment(comment.replies, id))
      .find((result) => result !== null) || null;
  };
  return findComment(data, parentId);
}

/**
 * Finds the maximum comment ID from an array of comments.
 * @param {Array} data - The array of comments, each containing a `commentId` property.
 * @returns {string} - The maximum comment ID as a string.
 */
function getMaxCommentId(data) {
  const compareIds = (id1, id2) => {
    const arr1 = id1.split('.').map(Number);
    const arr2 = id2.split('.').map(Number);
    for (let i = 0; i < Math.max(arr1.length, arr2.length); i += 1) {
      const segment1 = arr1[i] || 0;
      const segment2 = arr2[i] || 0;
      if (segment1 !== segment2) {
        return segment1 > segment2 ? id1 : id2;
      }
    }
    return id1;
  };

  return data.reduce((max, { commentId }) => compareIds(commentId, max), '0');
}

/**
 * Formats a timestamp into a relative time string.
 * @param {string|Date} timestamp - The timestamp to format. Can be a string or Date object.
 * @returns {string} - A relative time string such as "2 days ago" or "just now".
 */
const formatRelativeTime = (timestamp) => {
  const now = getIndianTimestamp();
  const then = new Date(timestamp);
  const difference = now.getTime() - then.getTime();

  const timeUnits = [
    { unit: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', value: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', value: 24 * 60 * 60 * 1000 },
    { unit: 'hour', value: 60 * 60 * 1000 },
    { unit: 'minute', value: 60 * 1000 },
    { unit: 'second', value: 1000 },
  ];

  // Find the appropriate time unit
  const timeUnit = timeUnits.find(({ value: unitValue }) => difference >= unitValue);

  if (timeUnit) {
    const time = Math.floor(difference / timeUnit.value);
    return `${time} ${timeUnit.unit}${time > 1 ? 's' : ''} ago`;
  }

  return 'just now';
};

/**
 * Toggles the visibility of the reply form for a specific comment.
 * @param {string} commentId - The ID of the comment whose reply form is to be toggled.
 */
function toggleReplyForm(commentId) {
  const replyForm = commentsSectionDiv.querySelector(`#reply-form-${commentId.replace('.', '\\.')}`);
  if (currentOpenReplyForm && currentOpenReplyForm !== replyForm) {
    currentOpenReplyForm.style.display = 'none';
  }
  const isCurrentlyVisible = replyForm.style.display === 'flex';
  replyForm.style.display = isCurrentlyVisible ? 'none' : 'flex';
  currentOpenReplyForm = isCurrentlyVisible ? null : replyForm;
}

/**
 * Submits a reply to a comment and updates the comments section.
 * @param {string} commentId - The ID of the comment to reply to.
 * @param {Array} comments - The array of comment data objects.
 */
async function submitReply(commentId, comments) {
  const replyForm = commentsSectionDiv.querySelector(`#reply-form-${commentId.replace('.', '\\.')}`);
  const textarea = replyForm?.querySelector('textarea');
  const replyText = textarea?.value.trim();
  if (!replyText) return;
  const newReply = await prepareComment(comments, commentId, replyText, 1);
  if (!newReply.postedBy.id) return;
  try {
    const updatedComments = await postComment(newReply);
    updateElement(updatedComments);
  } catch (error) {
    console.error('Error submitting reply:', error);
  } finally {
    textarea.value = '';
    replyForm.style.display = 'none';
    currentOpenReplyForm = null;
  }
}

/**
 * Submits a like for a comment.
 * @param {string} commentId - The ID of the comment to like.
 * @param {boolean} userHasLiked - Indicates if the user has liked the comment.
 * @returns {Object|null} - The response data from the API or null in case of an error.
 */
async function submitLike(commentId, userHasLiked) {
  const { id: userId } = userDetails;
  const { storyId } = config;
  const likedData = {
    storyId,
    userId,
    commentId,
    userHasLiked,
  };
  try {
    const { data } = await apiRequest({
      method: 'POST',
      endpoint: '/likeForComment',
      data: likedData,
    });

    return data ?? null;
  } catch (error) {
    console.error('Like For Comment Error:', error);
    return null;
  }
}

/**
 * Handles event delegation for comment interactions such as replying, liking, and submit.
 * @param {Event} event - The event object from the event listener.
 * @param {Array} comments - The array of comment data objects.
 */
async function handleEventDelegation(event, comments) {
  const { target } = event;
  const { commentId } = target.dataset;

  if (target.classList.contains('reply-button')) {
    toggleReplyForm(commentId);
  } else if (target.classList.contains('like-button')) {
    const isLiked = target.classList.toggle('liked');
    const currentComment = await getCommentById(comments, commentId);
    let likeCount = currentComment.likedBy.length;
    if (likeCount > 1) {
      likeCount = isLiked ? likeCount : likeCount - 1;
    } else {
      likeCount = 1;
    }
    const likeIconSrc = isLiked ? '/icons/fill-heart.svg' : '/icons/line-heart.svg';
    const iconContainer = target.closest('.comment-item').querySelector('.icon-line-heart');
    iconContainer.innerHTML = `<img data-icon-name="line-heart" src="${likeIconSrc}" alt="Heart Icon" loading="lazy">`;
    target.nextElementSibling?.remove();
    if (likeCount) {
      const likeElement = htmlToElement(`
          <div class="comment-action-count">
              <img src="/icons/liked.svg" alt="liked" loading="lazy">${likeCount}
          </div>
      `);
      target.insertAdjacentElement('afterend', likeElement);
    }
    await submitLike(commentId, isLiked);
    // If necessary, update the comments or UI after liking
    // updateElement(updatedComments);
  } else if (target.classList.contains('submit-reply')) {
    await submitReply(commentId, comments);
  }
}

/**
 * Updates the comments section by rendering the provided comments
 * and setting up event delegation for comment interactions.
 * @param {Array} comments - The array of comment data objects to render.
 */
function updateElement(comments) {
  commentsSectionDiv.innerHTML = '';
  const subContainer = document.createElement('div');
  subContainer.innerHTML = comments?.map(createCommentHtml).join('') || '';
  addTooltips(subContainer, 'Please login .....');
  commentsSectionDiv.appendChild(subContainer);
  subContainer.addEventListener('click', (event) => {
    if (isSignedIn) {
      handleEventDelegation(event, comments);
    }
  });

  const commentTexts = subContainer.querySelectorAll('.reply-comment');
  commentTexts.forEach((commentText) => {
    commentText.addEventListener('input', () => {
      commentText.style.height = 'auto';
      commentText.style.height = `${commentText.scrollHeight - 25}px`;
    });
  });
}

/**
 * Generates the HTML structure for a single comment, including its replies.
 * @param {Object} data - The comment data object.
 * @returns {string} - The HTML string for the comment and its replies.
 */
function createCommentHtml(data) {
  const {
    commentId, postedBy, commentText, postedDate, likedBy, replies,
  } = data;
  const repliesHtml = replies ? replies.map(createCommentHtml).join('') : '';

  // Determine the replies button visibility and like status
  const replyDepth = commentId.split('.').length;
  const authClass = isSignedIn ? '' : 'auth';
  const isLiked = likedBy && likedBy.includes(userDetails.id);
  const likeCount = likedBy.length;
  const replyCount = replies.length;
  const likeClass = isLiked ? 'liked' : '';
  const likeIcon = isLiked ? '/icons/fill-heart.svg' : '/icons/line-heart.svg';

  return `
    <div class="comment-items" id="${commentId}">
    <div class="comment-item">
        <div class="comment-details">
          <img src="${postedBy.image}" alt="${postedBy.name}" class="avatar">
          <div class="comment-body">
            <h3 class="author">${postedBy.name} <span class="date">${formatRelativeTime(postedDate)}</span></h3>
            <div class="comment-text">${commentText}</div>
            <div class="like">
              <span class="icon icon-line-heart">
                <img src="${likeIcon}" alt="Like"  class="like-button" data-comment-id="${commentId}" loading="lazy">
              </span>
            </div>
          </div>
        </div>
        <div class="comment-actions">
          <div class="comment-action-item">
            <button class="like-button interaction-button ${likeClass} ${authClass}" data-comment-id="${commentId}">Like</button>
            ${likeCount ? `<div class="comment-action-count"><img src="/icons/liked.svg" alt="liked" loading="lazy">${likeCount}</div>` : ''}
          </div>
            ${replyDepth < config.replyLimit ? `<div class="comment-action-item">
              <button class="reply-button interaction-button ${authClass}" data-comment-id="${commentId}">Reply</button>
              ${replyCount ? `<div class="comment-action-count">${replyCount} ${replyCount > 1 ? 'replies' : 'Reply'}</div>` : ''}
              </div>` : ''}
        </div>
        <div class="reply-form" id="reply-form-${commentId}">
          <textarea rows="1" class="reply-comment" placeholder="Write a reply..."></textarea>
          <button class="submit-comment submit-reply" data-comment-id="${commentId}">Reply</button>
        </div>
      </div>
      <div class="comment-replies">
        ${repliesHtml}
      </div>
    </div>
  `;
}

/**
 * Initializes the comment section within the specified block element.
 * Handles user authentication, comment data fetching, and comment submission.
 * @param {HTMLElement} block - The block element where the comment section will be rendered.
 */
async function initComments(block) {
  isSignedIn = await isSignedInUser();
  userDetails = isSignedIn ? await getUserData() : {};
  let comments = await getCommentData() || [];
  const btnText = isSignedIn ? 'Post a comment' : 'Please login to comment';
  const btnMode = isSignedIn ? '' : 'disabled';
  const userImage = isSignedIn ? userDetails.image : '../assets/profile.png';

  const commentContainer = htmlToElement(`
    <div class="comment-area">
      <div class="input-section">
        <div class="comment-input">
          <img src="${userImage}" alt="Avatar" class="avatar">
          <textarea class="main-comment" rows="1" placeholder="What are your thoughts?" ${btnMode}></textarea>
        </div>
        <div class="comment-actions align-right">
          <button class="submit-comment submit-main-comment">${btnText}</button>
        </div>
      </div>
      <div class="comments-section"></div>
    </div>
  `);

  block.innerHTML = '';
  block.appendChild(commentContainer);
  commentsSectionDiv = block.querySelector('.comments-section');
  if (comments.length) {
    updateElement(comments);
  }
  const commentText = block.querySelector('.main-comment');
  const submitBtn = block.querySelector('.submit-main-comment');

  commentText.addEventListener('input', () => {
    submitBtn.disabled = !commentText.value.trim();
    commentText.style.height = 'auto';
    commentText.style.height = `${commentText.scrollHeight - 40}px`;
  });

  // Add event listener to handle comment posting
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      window.adobeIMS.signIn();
    }
    const commentTextValue = block.querySelector('.main-comment').value.trim();
    if (!commentTextValue) return;
    submitBtn.disabled = true;
    block.querySelector('.main-comment').value = '';
    commentText.placeholder = 'Please wait, we are posting your comment...';
    comments = await getCommentData();
    const parentId = comments.length > 0
      ? Math.max(...comments.map((comment) => parseInt(comment.commentId, 10))) : 0;

    const newComment = await prepareComment(comments, parentId, commentTextValue);
    if (!newComment.postedBy.id) return;
    comments = await postComment(newComment);
    updateElement(comments);
    submitBtn.disabled = false;
    commentText.placeholder = 'What are your thoughts?';
  });
}

/**
 * Decorates the block element by configuring it with authored data,
 * @param {HTMLElement} block - The block element to be decorated.
 */
export default async function decorate(block) {
  config = {
    ...getAuthoredData(block),
    storyId: document.querySelector('meta[name="storyid"]')?.content || '',
  };

  config.replyLimit = isMobile ? 2 : config.replyLimit;

  // Update the block's inner HTML to show a loading spinner
  block.innerHTML = '<img src="/icons/loader.svg" class="loader" alt="loader" loading="lazy">';
  initComments(block, config);
}
