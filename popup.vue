<template>
  <div class="w-80 h-auto bg-[#FEFEFE]">
    <div class="border-b">
      <div class="flex mx-4 my-2 items-stretch gap-2">
        <img class="h-6" src="./assets/logo.svg" alt="Remak Logo" draggable="false" />
        <div v-if="email" class="grow w-full h-full items-center justify-center text-sm text-right text-gray-800">
          {{ email }}
        </div>
      </div>
    </div>
    <div class="p-4">
      <div v-if="!token" class="flex flex-col">
        <div class="text-center text-xs">
          링크를 저장하기 전에 먼저 Remak에 로그인이 필요해요.
        </div>
        <a href="https://remak.io/login" target="_blank">
          <div class="flex mt-4 h-10 w-full rounded-xl items-center justify-center text-center text-base font-bold text-white bg-remak-blue">
            로그인
          </div>
        </a>
      </div>
      <div v-else class="flex flex-col">
        <div>
          <div class="p-2 w-full rounded-sm border border-gray-400 bg-white break-all line-clamp-3 overflow-y-auto text-gray-700">
            {{ currentUrl }}
          </div>
          <div
            class="flex mt-4 w-full items-center justify-center text-sm"
            :class="hasError
                    ? 'text-red-500'
                    : success
                    ? 'text-remak-blue'
                    : 'text-gray-800'"
          >
            <div v-if="success" class="inline-flex mr-2">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Property 1=Variant2">
                <rect x="1" y="1" width="18" height="18" rx="9" fill="#1F8CE6"/>
                <path id="Vector" d="M7 10L9 12L13 8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="1" y="1" width="18" height="18" rx="9" stroke="#1F8CE6" stroke-width="2"/>
                </g>
              </svg>
            </div>
            {{ saveStatusMessage }}
            <div v-if="success" class="inline-flex ml-2">
              <button @click="resultLink">
                <div class="flex items-baseline gap-1 border-b border-gray-300">
                  <div>
                    확인하기
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                    <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                  </svg>
                </div>
              </button>
            </div>
            <div v-if="hasError" class="inline-flex ml-2">
              <button @click="retry">
                <div class="flex items-baseline gap-1 border-b border-gray-300">
                  <div>
                    재시도
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div v-if="success" class="flex gap-4 h-10 mt-4">
          <button class="h-full w-1/2 rounded-xl items-center justify-center text-center text-base font-bold text-gray-900 bg-[#E6E8EB]" @click="deleteUrl">
            삭제하기
          </button>
          <button class="h-full w-1/2 rounded-xl items-center justify-center text-center text-base font-bold text-white bg-remak-blue" @click="close">
            완료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type App } from "vue";
import "./style.css";

const token = ref('');
const email = ref('');
const role = ref('');

const currentUrl = ref('');
const saveStatusMessage = ref('올바른 URL이 아니에요!');
const success = ref(false);
const hasError = ref(false);
const resultDocId = ref('');

// remak.io의 쿠키를 가져옵니다.
chrome.cookies.get({ url: "https://remak.io", name: "auth" }, (cookie) => {
  if (cookie) {
    token.value = JSON.parse(decodeURIComponent(cookie.value)).accessToken;

    // 유저정보 쿼리
    fetch("https://api.remak.io/user", {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token.value}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          email.value = res.data.email;
          role.value = res.data.role;
        } else {
          token.value = '';
        }
      });

    // 현재 탭의 URL을 가져옵니다.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentUrl.value = tabs[0].url;
      saveUrl();
    });
  }
});

const saveUrl = () => {
  // 링크 저장하기
  hasError.value = false;
  success.value = false;
  if (currentUrl.value.startsWith('http')) {
    saveStatusMessage.value = '저장 중입니다...';

    fetch("https://api.remak.io/document/webpage", {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: ' ',
        url: currentUrl.value,
        content: ' ',
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          saveStatusMessage.value = '저장되었어요.';
          resultDocId.value = res.data.docId;
          success.value = true;
        } else {
          saveStatusMessage.value = '저장에 실패했어요.';
          hasError.value = true;
        }
      });
  } else {
    saveStatusMessage.value = '올바른 URL이 아니에요!';
  }
}

// 재시도
const retry = () => {
  saveUrl();
}

// 링크 삭제하기
const deleteUrl = () => {
  if (resultDocId.value) {
    fetch(`https://api.remak.io/document/${resultDocId.value}`, {
      method: "DELETE",
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${token.value}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message === 'success') {
          success.value = false;
          saveStatusMessage.value = '삭제되었어요.';
          window.close();
        } else {
          success.value = false;
          saveStatusMessage.value = '삭제에 실패했어요.';
          hasError.value = true;
        }
      });
  }
}

// 팝업 닫기
const close = () => {
  window.close();
};

// 저장된 링크 열기
const resultLink = () => {
  chrome.tabs.create({ url: 'https://remak.io/main' });
};

defineOptions({
  prepare(app: App) {
    // Use any plugins here:
    // app.use
  }
})
</script>
