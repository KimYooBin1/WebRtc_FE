import {useRouter} from "next/router";

interface IUseMoveToPageReturn {
  onClickMoveToPage: (path: string) => () => void;
}

export const useMoveToPage = (): IUseMoveToPageReturn => {
  const router = useRouter();

  const onClickMoveToPage = (path: string) => () => {
    localStorage.setItem("visitedPage", path);
    void router.push(path);
  };
  return { onClickMoveToPage };
};
