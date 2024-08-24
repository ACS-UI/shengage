/* eslint-disable no-use-before-define */
/*
 * Reaction Block
 * Collects the user's reaction
 */
import { htmlToElement, apiRequest } from '../../scripts/scripts.js';
import { isSignedInUser, getUserData } from '../../scripts/profile.js';

let userDetails = [];
let commentsSectionDiv;
let currentOpenReplyForm = null;
let isSignedIn = false;
let config = {};

async function getCommentData() {
  const endpoint = '/getComments';
  const storyId = document.querySelector('meta[name="storyid"]')?.content;

  try {
    const { data } = await apiRequest({
      method: 'POST',
      endpoint,
      data: {
        storyId,
        ...(userDetails.id && { userId: userDetails.id }),
      },
    });
    return data ?? null;
  } catch (error) {
    console.error('Error Get Comments Data:', error);
    return null;
  }
}

const prepareComment = (comments, parentId, commentText, currentLevel = 0) => {
  const currentComment = getCommentById(comments, parentId);
  const maxId = currentComment?.reply ? getMaxCommentId(currentComment.reply) : 0;
  const newId = maxId ? `${parentId}.${parseInt(maxId.split('.').pop(), 10) + 1}` : `${parentId}.1`;
  const commentId = currentLevel === 0 ? `${parseInt(parentId, 10) + 1}` : newId;
  const newComment = {
    storyId: config.storyId,
    commentId,
    commentText,
    postedBy: userDetails,
    postedDate: getIndianTimestamp(),
  };
  return newComment;
};

async function postComment(comment) {
  const endpoint = '/postComment';
  try {
    const { data } = await apiRequest({
      method: 'POST',
      endpoint,
      data: comment,
    });
    return data ?? null;
  } catch (error) {
    console.error('Error Post Comment:', error);
    return null;
  }
}

function getIndianTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  return new Date(now.getTime() + istOffset);
}

function getCommentById(data, parent) {
  const directMatch = data?.find((comment) => comment.commentId === parent);
  if (directMatch) {
    return directMatch;
  }
  return data
    .flatMap((comment) => comment.reply || [])
    .reduce((acc, replies) => acc || getCommentById([replies], parent), null);
}

function getMaxCommentId(data) {
  return data.reduce((max, comment) => {
    const compareIds = (id1, id2) => {
      const arr1 = id1.split('.').map(Number);
      const arr2 = id2.split('.').map(Number);
      for (let i = 0; i < Math.max(arr1.length, arr2.length); i += 1) {
        const segment1 = arr1[i] || 0;
        const segment2 = arr2[i] || 0;
        if (segment1 > segment2) return id1;
        if (segment1 < segment2) return id2;
      }
      return id1;
    };
    return compareIds(comment.commentId, max) === comment.commentId ? comment.commentId : max;
  }, '0');
}

const formatRelativeTime = (timestamp) => {
  const difference = getIndianTimestamp().getTime() - new Date(timestamp).getTime();

  const timeUnits = [
    { unit: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { unit: 'month', value: 30 * 24 * 60 * 60 * 1000 },
    { unit: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { unit: 'day', value: 24 * 60 * 60 * 1000 },
    { unit: 'hour', value: 60 * 60 * 1000 },
    { unit: 'minute', value: 60 * 1000 },
    { unit: 'second', value: 1000 },
  ];

  const timeUnit = timeUnits.find(({ value }) => Math.floor(difference / value) >= 1);

  if (timeUnit) {
    const time = Math.floor(difference / timeUnit.value);
    return `${time} ${timeUnit.unit}${time > 1 ? 's' : ''} ago`;
  }

  return 'just now';
};

function toggleReplyForm(commentId) {
  const replyForm = commentsSectionDiv.querySelector(`#reply-form-${commentId}`);
  if (currentOpenReplyForm && currentOpenReplyForm !== replyForm) {
    currentOpenReplyForm.style.display = 'none';
  }
  if (replyForm.style.display === 'none' || !replyForm.style.display) {
    replyForm.style.display = 'flex';
    currentOpenReplyForm = replyForm;
  } else {
    replyForm.style.display = 'none';
    currentOpenReplyForm = null;
  }
}

// Function to submit a reply
async function submitReply(commentId, comments) {
  const replyForm = commentsSectionDiv.querySelector(`#reply-form-${commentId}`);
  const textarea = replyForm.querySelector('textarea');
  const replyText = textarea.value.trim();
  if (!replyText) return;

  const newReply = prepareComment(comments, commentId, replyText, 1);
  if (!newReply.postedBy.id) return;
  const newComments = await postComment(newReply);
  updateElement(newComments);
  textarea.value = '';
  replyForm.style.display = 'none';
  currentOpenReplyForm = null;
}

// Function to submit a reply
async function submitLike(commentId, userHasLiked) {
  const userId = userDetails.id;
  const likedData = {
    storyId: config.storyId,
    userId,
    commentId,
    userHasLiked,
  };

  const endpoint = '/likeForComment';
  try {
    const { data } = await apiRequest({
      method: 'POST',
      endpoint,
      data: likedData,
    });
    return data ?? null;
  } catch (error) {
    console.error('Like For Comment:', error);
    return null;
  }
}

// Function to handle event delegation
async function handleEventDelegation(event, comments) {
  if (event.target && event.target.classList.contains('reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    toggleReplyForm(commentId);
  } else if (event.target && event.target.classList.contains('like-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    const target = event.target;
    const isLike = !target.classList.toggle('Like');
    target.innerHTML = isLike ? 'Like' : 'Dislike';

    const likeImgSrc = isLike ? '/icons/fill-heart.svg' : '/icons/line-heart.svg';
    const iconContainer = target.closest('.comment-body').querySelector('.icon-line-heart');

    iconContainer.innerHTML = `<img data-icon-name="line-heart" src="${likeImgSrc}" alt="" loading="lazy">`;
    submitLike(commentId, isLike);
    // updateElement(uodatedComments);
  } else if (event.target && event.target.classList.contains('submit-reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    submitReply(commentId, comments);
  }
}

function updateElement(comments) {
  commentsSectionDiv.innerHTML = comments?.map(createCommentHtml).join('');
  commentsSectionDiv.addEventListener('click', (event) => { handleEventDelegation(event, comments); });
}

function getAuthoredData(block) {
  const authorData = {};
  // iterate over children and get all authoring data
  block.childNodes.forEach((child) => {
    if (child.nodeType === 1) {
      const objText = 'obj';
      let firstDivText = child.children[0].textContent.trim();
      let secondDivText = child.children[1]?.textContent.trim();

      if (firstDivText.indexOf(objText) >= 0) {
        firstDivText = firstDivText.replace(objText, '').trim();
        secondDivText = secondDivText?.split(',');
      }
      authorData[firstDivText] = secondDivText;
    }
  });

  return authorData;
}

function createCommentHtml(data) {
  const repliesHtml = data.reply ? data.reply.map(createCommentHtml).join('') : '';
  const replyLength = data.commentId.split('.').length;
  const replyBtn = (replyLength >= config.replyLimit || !isSignedIn) ? '' : `<button class="reply-button" data-comment-id="${data.commentId}">Reply</button>`;
  const likeText = data.likedBy && data.likedBy.includes(userDetails.id) ? 'Dislike' : 'Like';
  const likeImg = data.likedBy && data.likedBy.includes(userDetails.id) ? '/icons/fill-heart.svg' : '/icons/line-heart.svg';

  return `
    <div class="comment-items" id="${data.commentId}">
      <div class="comment-item">
        <img src="${data.postedBy.image}" alt="${data.postedBy.name}" class="avatar">
        <div class="comment-body">
          <h3 class="author">${data.postedBy.name} <span class="date">${formatRelativeTime(data.postedDate)}</span></h3>
          <div class="comment-text">${data.commentText}</div>
          <div class="comment-actions">
            <button class="like-button ${likeText}" data-comment-id="${data.commentId}">${likeText}</button>
            ${replyBtn}
          </div>
          <div class="reply-form" id="reply-form-${data.commentId}">
            <textarea placeholder="Write a reply..."></textarea>
            <button class="post-comment submit-reply-button" data-comment-id="${data.commentId}">Reply</button>
          </div>
          <div class="like"> <span class="icon icon-line-heart"><img data-icon-name="line-heart" src="${likeImg}" alt="" loading="lazy"></span> </div>
        </div>
      </div>
      <div class="comment-replies">
        ${repliesHtml}
      </div>
    </div>
  `;
}

async function initComments(block) {
  isSignedIn = await isSignedInUser();
  if (isSignedIn) userDetails = await getUserData() || [];
  let comments = await getCommentData() || [];
  const btnText = !isSignedIn ? 'Please login to comment' : 'Post a comment';
  const disabled = !isSignedIn ? 'disabled' : '';
  userDetails.image = isSignedIn ? userDetails.image : '../assets/profile.png';
  const commentContainer = htmlToElement(`
        <div class="comment-area">
          <div class="input-section">
            <div class="comment-input">
                <img src="${userDetails.image}" alt="Avatar" class="avatar">
                <textarea  id="commentText" rows="5" placeholder="What are your thoughts?" ${disabled}></textarea>
            </div>
            <div class="comment-actions right">
              <button class="post-comment main-comment">${btnText}</button>
            </div>
          </div>
          <div class="comments-section"></div>
        </div>`);

  block.innerHTML = '';
  block.appendChild(commentContainer);
  commentsSectionDiv = block.querySelector('.comments-section');
  if (comments) updateElement(comments);

  block.querySelector('.main-comment').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      window.adobeIMS.signIn();
    }
    const commentText = block.querySelector('#commentText').value.trim();
    if (!commentText) return;
    const parentId = comments.length > 0
      ? Math.max(...comments.map((comment) => parseInt(comment.commentId, 10))) : 0;

    const newComment = prepareComment(comments, parentId, commentText);
    if (!newComment.postedBy.id) return;
    comments = await postComment(newComment);
    updateElement(comments);
    block.querySelector('#commentText').value = '';
  });
}

export default async function decorate(block) {
  config = getAuthoredData(block);
  config.storyId = document.querySelector('meta[name="storyid"]')?.content;
  block.innerHTML = '<img src="/icons/loader.svg" class="loader" alt="loader" loading="lazy">';
  initComments(block);
}
