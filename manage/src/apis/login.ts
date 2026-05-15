import request from "@/utils/http";
import type { UserRuleForm } from "@/interface/login";

export const loginByJson = ( data: UserRuleForm ): Promise<UsernameRequest> => {
  return request({
    url: "/u/loginByJson",
    method: "post",
    data,
  });
};

interface UsernameRequest{
	code:string
	msg:string
	data?:string
}

// 图形验证码
export const captchaImage = (key: string): Promise<ArrayBuffer> => {
  return request({
    url: "/captcha/image",
    responseType: "arraybuffer",
    params: {
      key,
    },
  });
};
