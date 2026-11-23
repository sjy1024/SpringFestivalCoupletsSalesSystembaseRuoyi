package com.ruoyi.framework.config;

import java.util.Properties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.google.code.kaptcha.impl.DefaultKaptcha;
import com.google.code.kaptcha.util.Config;
import static com.google.code.kaptcha.Constants.*;

/**
 * 验证码配置
 * 
 * @author ruoyi
 */
@Configuration
public class CaptchaConfig
{
    @Bean(name = "captchaProducer")
    public DefaultKaptcha getKaptchaBean()
    {
        DefaultKaptcha defaultKaptcha = new DefaultKaptcha();
        Properties properties = new Properties();
        // 是否有边框
        properties.setProperty(KAPTCHA_BORDER, "yes");
        // 边框颜色 RGB格式 - 红色
        properties.setProperty(KAPTCHA_BORDER_COLOR, "255,0,0");
        // 验证码文本字符颜色 - 红色
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_COLOR, "255,0,0");
        // 验证码图片宽度
        properties.setProperty(KAPTCHA_IMAGE_WIDTH, "150");
        // 验证码图片高度
        properties.setProperty(KAPTCHA_IMAGE_HEIGHT, "50");
        // 验证码文本字符大小
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_SIZE, "36");
        // KAPTCHA_SESSION_KEY
        properties.setProperty(KAPTCHA_SESSION_CONFIG_KEY, "kaptchaCode");
        // 验证码文本字符长度
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_LENGTH, "4");
        // 验证码文本字体样式
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_NAMES, "Arial,Courier,Verdana");
        // 验证码文本字符间距
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_SPACE, "4");
        // 背景颜色 RGB格式 - 白色
        properties.setProperty(KAPTCHA_BACKGROUND_CLR_FROM, "255,255,255");
        properties.setProperty(KAPTCHA_BACKGROUND_CLR_TO, "255,255,255");
        // 干扰线颜色
        properties.setProperty(KAPTCHA_NOISE_COLOR, "180,180,180");
        // 干扰实现类 NoNoise(无干扰) DefaultNoise(默认干扰)
        properties.setProperty(KAPTCHA_NOISE_IMPL, "com.google.code.kaptcha.impl.DefaultNoise");
        // 图片样式 WaterRipple(水纹) FishEyeGimpy(鱼眼) ShadowGimpy(阴影)
        properties.setProperty(KAPTCHA_OBSCURIFICATOR_IMPL, "com.google.code.kaptcha.impl.FishEyeGimpy");
        Config config = new Config(properties);
        defaultKaptcha.setConfig(config);
        return defaultKaptcha;
    }

    @Bean(name = "captchaProducerMath")
    public DefaultKaptcha getKaptchaBeanMath()
    {
        DefaultKaptcha defaultKaptcha = new DefaultKaptcha();
        Properties properties = new Properties();
        // 是否有边框
        properties.setProperty(KAPTCHA_BORDER, "yes");
        // 边框颜色 RGB格式 - 红色
        properties.setProperty(KAPTCHA_BORDER_COLOR, "255,0,0");
        // 验证码文本字符颜色 - 红色
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_COLOR, "255,0,0");
        // 验证码图片宽度
        properties.setProperty(KAPTCHA_IMAGE_WIDTH, "150");
        // 验证码图片高度
        properties.setProperty(KAPTCHA_IMAGE_HEIGHT, "50");
        // 验证码文本字符大小
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_SIZE, "35");
        // KAPTCHA_SESSION_KEY
        properties.setProperty(KAPTCHA_SESSION_CONFIG_KEY, "kaptchaCodeMath");
        // 验证码文本生成器
        properties.setProperty(KAPTCHA_TEXTPRODUCER_IMPL, "com.ruoyi.framework.config.KaptchaTextCreator");
        // 验证码文本字符间距
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_SPACE, "4");
        // 验证码文本字符长度
        properties.setProperty(KAPTCHA_TEXTPRODUCER_CHAR_LENGTH, "6");
        // 验证码文本字体样式
        properties.setProperty(KAPTCHA_TEXTPRODUCER_FONT_NAMES, "Arial,Courier,Verdana");
        // 背景颜色 RGB格式 - 白色
        properties.setProperty(KAPTCHA_BACKGROUND_CLR_FROM, "255,255,255");
        properties.setProperty(KAPTCHA_BACKGROUND_CLR_TO, "255,255,255");
        // 验证码噪点颜色
        properties.setProperty(KAPTCHA_NOISE_COLOR, "200,200,200");
        // 干扰实现类 NoNoise(无干扰) DefaultNoise(默认干扰)
        properties.setProperty(KAPTCHA_NOISE_IMPL, "com.google.code.kaptcha.impl.DefaultNoise");
        // 图片样式 WaterRipple(水纹) FishEyeGimpy(鱼眼) ShadowGimpy(阴影)
        properties.setProperty(KAPTCHA_OBSCURIFICATOR_IMPL, "com.google.code.kaptcha.impl.WaterRipple");
        Config config = new Config(properties);
        defaultKaptcha.setConfig(config);
        return defaultKaptcha;
    }
}
