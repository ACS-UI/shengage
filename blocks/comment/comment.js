/*
 * Reaction Block
 * Collects the user's reaction
 */
import { htmlToElement, loadIms } from '../../scripts/scripts.js';

let comments = [];
let userDetails = {};
let parentId;
let commentsSectionDiv;
let currentOpenReplyForm = null;
let isSignedIn = false;

async function getUserData() {
  userDetails = {
    id: 'UN001',
    name: 'you',
    avatar: '../assets/profile.png',
  };

  if (isSignedIn) {
    userDetails.id = (await window.adobeIMS.getProfile()).userId;
    userDetails.name = (await window.adobeIMS.getProfile()).displayName;
  }
}

async function getCommentData() {
  const apiUrl = 'http://localhost:8080/read';
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

function getIndianTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  return new Date(now.getTime() + istOffset);
}

function getCommentById(data, parent) {
  const directMatch = data.find((comment) => comment.commentId === parent);
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

const prepareComment = (commentText, currentLevel = 0) => {
  const storryId = document.querySelector('meta[name="storryid"]')?.content;
  const currentComment = getCommentById(comments, parentId);
  const maxId = currentComment?.reply ? getMaxCommentId(currentComment.reply) : 0;
  const newId = maxId ? `${parentId}.${parseInt(maxId.split('.').pop(), 10) + 1}` : `${parentId}.1`;
  const commentId = currentLevel === 0 ? `${parseInt(parentId, 10) + 1}` : newId;

  const newComment = {
    storryId,
    commentId,
    commentText,
    postedBy: userDetails,
    postedDate: getIndianTimestamp(),
  };

  if (currentComment) {
    currentComment.reply = currentComment.reply
      ? [...currentComment.reply, newComment] : [newComment];
  } else {
    comments.push(newComment);
  }

  return newComment;
};

const formatRelativeTime = (timestamp) => {
  const difference = Date.now() - new Date(timestamp).getTime();

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

function triggerApiCall() {
  // Example API call:
  fetch('http://localhost:8080/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comments),
  })
    .then((response) => response.json())
    .then((data) => console.log('Success:', data))
    .catch((error) => console.error('Error:', error));
}

function createCommentHtml(data) {
  const repliesHtml = data.reply ? data.reply.map(createCommentHtml).join('') : '';
  return `
    <div class="comment-items" id="${data.commentId}">
      <div class="comment-item">
        <img src="${data.postedBy.avatar}" alt="${data.postedBy.name}" class="avatar">
        <div class="comment-body">
          <h3 class="author">${data.postedBy.name} <span class="date">${formatRelativeTime(data.postedDate)}</span></h3>
          <p>${data.commentText}</p>
          <div class="comment-actions">
            <button>Like</button>
            <button class="reply-button" data-comment-id="${data.commentId}">Reply</button>
          </div>
          <div class="reply-form" id="reply-form-${data.commentId}">
            <textarea placeholder="Write a reply..."></textarea>
            <button class="post-comment submit-reply-button" data-comment-id="${data.commentId}">Reply</button>
          </div>
        </div>
      </div>
      <div class="comment-replies">
        ${repliesHtml}
      </div>
    </div>
  `;
}

function toggleReplyForm(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  if (currentOpenReplyForm && currentOpenReplyForm !== replyForm) {
    currentOpenReplyForm.style.display = 'none';
  }
  if (replyForm.style.display === 'none' || !replyForm.style.display) {
    replyForm.style.display = 'block';
    currentOpenReplyForm = replyForm;
  } else {
    replyForm.style.display = 'none';
    currentOpenReplyForm = null;
  }
}

// Function to submit a reply
function submitReply(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);
  const textarea = replyForm.querySelector('textarea');
  const replyText = textarea.value.trim();
  if (!replyText) return;
  parentId = commentId;

  const data = prepareComment(replyText, 1);
  if (!data.storryId) return;
  triggerApiCall(data);
  updateElement();
  textarea.value = '';
  replyForm.style.display = 'none';
  currentOpenReplyForm = null;
}

// Function to handle event delegation
function handleEventDelegation(event) {
  if (event.target && event.target.classList.contains('reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    toggleReplyForm(commentId);
  } else if (event.target && event.target.classList.contains('submit-reply-button')) {
    const commentId = event.target.getAttribute('data-comment-id');
    submitReply(commentId);
  }
}

function updateElement() {
  commentsSectionDiv.innerHTML = comments.map(createCommentHtml).join('');
  commentsSectionDiv.addEventListener('click', handleEventDelegation);
}

async function isSignedInUser() {
  try {
    await loadIms();
    return window?.adobeIMS?.isSignedInUser() || false;
  } catch (err) {
    return false;
  }
}

export default async function decorate(block) {
  await getUserData();
  isSignedIn = await isSignedInUser();
  comments = await getCommentData();
  const btnText = !isSignedIn ? 'Please login to comment' : 'Post a comment';
  const commentContainer = htmlToElement(`
        <div class="comment-area">
            <div class="comment-input">
                <img src="${userDetails.avatar}" alt="Avatar" class="avatar">
                <textarea id="commentText" rows="5" placeholder="What are your thoughts?"></textarea>
            </div>
            <div class="comment-actions right">
              <button class="post-comment" id="postComment">${btnText}</button>
            </div>
            <div id="commentsSection"></div>
        </div>`);

  block.innerHTML = '';
  block.appendChild(commentContainer);
  commentsSectionDiv = block.querySelector('#commentsSection');
  updateElement();

  block.querySelector('#postComment').addEventListener('click', (e) => {
    const commentText = block.querySelector('#commentText').value.trim();
    if (!commentText) return;
    e.preventDefault();
    window.adobeIMS.signIn();
    parentId = comments.length > 0
      ? Math.max(...comments.map((comment) => parseInt(comment.commentId, 10))) : 1;

    const data = prepareComment(commentText);
    if (!data.storryId) return;
    triggerApiCall(data);
    updateElement();
    block.querySelector('#commentText').value = '';
  });
}
