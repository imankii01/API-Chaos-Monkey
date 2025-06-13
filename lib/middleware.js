const { logger } = require('./utils');

/**
 * Middleware implementations for different frameworks
 */
class MiddlewareFactory {
  
  /**
   * Create universal middleware that detects framework
   */
  static createMiddleware(chaosEngine, config) {
    return async (req, res, next) => {
      // Detect framework type
      if (res.json && res.status) {
        // Express-like
        return this.handleExpressLike(chaosEngine, config, req, res, next);
      } else if (typeof req === 'object' && req.ctx) {
        // Koa-like
        return this.handleKoa(chaosEngine, config, req, res, next);
      } else {
        // Generic/raw HTTP
        return this.handleGeneric(chaosEngine, config, req, res, next);
      }
    };
  }

  /**
   * Express middleware
   */
  static expressMiddleware(chaosEngine) {
    return async (req, res, next) => {
      try {
        const context = {
          path: req.path || req.url,
          method: req.method,
          headers: req.headers,
          query: req.query,
          body: req.body
        };

        const chaosResult = await chaosEngine.applyChaos(context);
        
        if (chaosResult.type === 'none') {
          return next();
        }

        // Handle different chaos types
        switch (chaosResult.type) {
          case 'delay':
            // Delay was already applied, continue normally
            return next();
            
          case 'error':
            return res.status(chaosResult.statusCode).json({
              error: true,
              message: chaosResult.message,
              chaosId: chaosResult.chaosId,
              timestamp: new Date().toISOString()
            });
            
          case 'gibberish':
            res.set('Content-Type', chaosResult.contentType);
            return res.send(chaosResult.content);
            
          default:
            return next();
        }
      } catch (error) {
        logger.error('Chaos middleware error:', error);
        return next();
      }
    };
  }

  /**
   * Koa middleware
   */
  static koaMiddleware(chaosEngine) {
    return async (ctx, next) => {
      try {
        const context = {
          path: ctx.path,
          method: ctx.method,
          headers: ctx.headers,
          query: ctx.query,
          body: ctx.request.body
        };

        const chaosResult = await chaosEngine.applyChaos(context);
        
        if (chaosResult.type === 'none') {
          return await next();
        }

        switch (chaosResult.type) {
          case 'delay':
            return await next();
            
          case 'error':
            ctx.status = chaosResult.statusCode;
            ctx.body = {
              error: true,
              message: chaosResult.message,
              chaosId: chaosResult.chaosId,
              timestamp: new Date().toISOString()
            };
            return;
            
          case 'gibberish':
            ctx.type = chaosResult.contentType;
            ctx.body = chaosResult.content;
            return;
            
          default:
            return await next();
        }
      } catch (error) {
        logger.error('Chaos middleware error:', error);
        return await next();
      }
    };
  }

  /**
   * Fastify plugin
   */
  static fastifyPlugin(chaosEngine) {
    return async function chaosPlugin(fastify, options) {
      fastify.addHook('preHandler', async (request, reply) => {
        try {
          const context = {
            path: request.url,
            method: request.method,
            headers: request.headers,
            query: request.query,
            body: request.body
          };

          const chaosResult = await chaosEngine.applyChaos(context);
          
          if (chaosResult.type === 'none') {
            return;
          }

          switch (chaosResult.type) {
            case 'delay':
              return;
              
            case 'error':
              reply.code(chaosResult.statusCode);
              return reply.send({
                error: true,
                message: chaosResult.message,
                chaosId: chaosResult.chaosId,
                timestamp: new Date().toISOString()
              });
              
            case 'gibberish':
              reply.type(chaosResult.contentType);
              return reply.send(chaosResult.content);
          }
        } catch (error) {
          logger.error('Chaos middleware error:', error);
        }
      });
    };
  }

  /**
   * Handle Express-like frameworks
   */
  static async handleExpressLike(chaosEngine, config, req, res, next) {
    return this.expressMiddleware(chaosEngine)(req, res, next);
  }

  /**
   * Handle Koa-like frameworks
   */
  static async handleKoa(chaosEngine, config, ctx, next) {
    return this.koaMiddleware(chaosEngine)(ctx, next);
  }

  /**
   * Handle generic HTTP
   */
  static async handleGeneric(chaosEngine, config, req, res, next) {
    // Fallback to Express-like behavior
    return this.expressMiddleware(chaosEngine)(req, res, next || (() => {}));
  }
}

module.exports = MiddlewareFactory;