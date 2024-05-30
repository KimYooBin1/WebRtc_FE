import {useRouter} from "next/router";

interface IUseMoveToPageReturn {
  onClickMoveToPage: (path: string) => () => void;
  onClickActionAndMoveToPage: (path: string, callback: () => void) => void;
}

export const useMoveToPage = (): IUseMoveToPageReturn => {
  const router = useRouter();

  const onClickMoveToPage = (path: string) => () => {
    console.log("page move")
    void router.push(path);
  };
  const onClickActionAndMoveToPage = (path:string, callback:()=>void) =>() =>{
    callback();
    void router.push(path)
  }
  return { onClickMoveToPage, onClickActionAndMoveToPage };
};
