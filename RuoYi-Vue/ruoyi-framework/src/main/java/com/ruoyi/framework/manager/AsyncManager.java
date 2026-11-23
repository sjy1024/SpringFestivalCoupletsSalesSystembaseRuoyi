package com.ruoyi.framework.manager;

import java.util.TimerTask;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import com.ruoyi.common.utils.Threads;
import com.ruoyi.common.utils.spring.SpringUtils;

/**
 * 异步任务管理器
 * 
 * @author ruoyi
 */
public class AsyncManager
{
    /**
     * 操作延迟10毫秒
     */
    private final int OPERATE_DELAY_TIME = 10;

    /**
     * 异步操作任务调度线程池（延迟获取，避免 DevTools 热重启时静态初始化失败）
     */
    private ScheduledExecutorService executor;

    private AsyncManager() {}

    private static volatile AsyncManager me;

    public static AsyncManager me()
    {
        if (me == null)
        {
            synchronized (AsyncManager.class)
            {
                if (me == null)
                {
                    me = new AsyncManager();
                }
            }
        }
        return me;
    }

    /**
     * 应用关闭时安全停止（不触发新建实例）
     */
    public static void shutdownIfPresent()
    {
        AsyncManager manager = me;
        if (manager != null)
        {
            manager.shutdown();
        }
    }

    private ScheduledExecutorService getExecutor()
    {
        if (executor == null)
        {
            executor = SpringUtils.getBean("scheduledExecutorService");
        }
        return executor;
    }

    /**
     * 执行任务
     * 
     * @param task 任务
     */
    public void execute(TimerTask task)
    {
        try
        {
            getExecutor().schedule(task, OPERATE_DELAY_TIME, TimeUnit.MILLISECONDS);
        }
        catch (Exception e)
        {
            // 应用关闭或 DevTools 重启期间，跳过后台日志任务
        }
    }

    /**
     * 停止任务线程池
     */
    public void shutdown()
    {
        if (executor != null)
        {
            Threads.shutdownAndAwaitTermination(executor);
            executor = null;
        }
        me = null;
    }
}
