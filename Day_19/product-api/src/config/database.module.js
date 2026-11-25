const { Module, Global } = require('@nestjs/common');

const database = require('./database');

class DatabaseModule {}

Global()(DatabaseModule);

Module({
  providers: [
    {
      provide: 'DB_POOL',
      useValue: database.getPool()
    }
  ],
  exports: ['DB_POOL']
})(DatabaseModule);

module.exports = DatabaseModule;
