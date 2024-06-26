import { getRandomIndex } from './utils.js';

const quoteTextLm = document.getElementById('quote__text');
export let quotesData = JSON.parse(localStorage.getItem('quotesData')) || null;

export async function getQuoteData() {
  quoteTextLm.classList.add('load-quote');
  const response = await fetch('https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json');
  if (response.status !== 200) {
    throw new Error("Couldn't fetch the quote data.");
  }
  return await response.json();
}

export function generateQuote(data) {
  const quoteAutorLm = document.getElementById('quote__author');
  quoteTextLm.innerHTML = ` 
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"/></svg>
    ${data.quote}
  `;
  quoteAutorLm.innerText = `- ${data.author}`;
}

export function setQuoteCache(value) {
  quotesData = value;
  localStorage.setItem('quotesData', JSON.stringify(value));
}

export function setShareBtnsHrefAtr(randomCurrentQuote) {
  const shareWithTwitterBtn = document.getElementById('quote__share-with-twitter-btn');
  const shareWithTumblrBtn = document.getElementById('quote__share-with-tumblr-btn');
  const msg = encodeURIComponent(`"${randomCurrentQuote.quote}" - ${randomCurrentQuote.author}`)
  const quote = encodeURIComponent(randomCurrentQuote.quote);
  const author = encodeURIComponent(randomCurrentQuote.author);
  shareWithTwitterBtn.href = `https://twitter.com/intent/tweet?hashtags=quotes,inspirational,success&text=${msg}`;
  shareWithTumblrBtn.href = `https://www.tumblr.com/widgets/share/tool?posttype=quote&tags=quotes&caption=${author}&content=${quote}&canonicalUrl=https%3A%2F%2Fwww.tumblr.com%2Fbuttons&shareSource=tumblr_share_button`;
}

export function checkQuotesData() {
  if (!quotesData) {
    getQuoteData()
    .then((data) =>{
      quoteTextLm.classList.remove('load-quote');
      setQuoteCache(data.quotes);
      const randomCurrentQuote = quotesData[getRandomIndex(quotesData)];
      generateQuote(randomCurrentQuote);
      setShareBtnsHrefAtr(randomCurrentQuote);
    })
    .catch((err) => {
      quoteTextLm.classList.remove('load-quote');
      quoteTextLm.innerHTML = `<p>Couldn't fetch the quote data.</p>`;
      console.error(err);
    });
  } 
  else {
    const randomCurrentQuote = quotesData[getRandomIndex(quotesData)];
    generateQuote(randomCurrentQuote);
    setShareBtnsHrefAtr(randomCurrentQuote);
  }
}