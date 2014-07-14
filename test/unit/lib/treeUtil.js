const treeUtil = require('lib/treeUtil');
const should = require('should');

describe('treeUtil', function() {

  const tree = {children: [
    { _id:      '1',
      title:    'Article 1',
      isFolder: true,
      weight:   0,
      children: [
        { _id:      '2',
          title:    'Article 1.1',
          weight:   0,
          parent:   '1',
          isFolder: true,
          children: [
            { _id:      '3',
              title:    'Article 1.1.1',
              weight:   0,
              isFolder: false,
              parent:   '2' },
            { _id:      '4',
              title:    'Article 1.1.2',
              isFolder: false,
              weight:   1,
              parent:   '2' }
          ]
        },
        { _id:    '5',
          title:  'Article 1.2',
          weight: 1,
          isFolder: false,
          parent: '1' }
      ] },
    { _id:      '6',
      title:    'Article 2',
      weight:   1,
      isFolder: true,
      children: [
        { _id:    '7',
          title:  'Article 2.1',
          weight: 0,
          isFolder: false,
          parent: '6' },
        { _id:    '8',
          title:  'Article 2.2',
          weight: 1,
          isFolder: false,
          parent: '6' }
      ] }
  ]};

  it('finds next', function() {
    treeUtil.findPrevNextById(tree, 3).next._id.should.be.eql(4);
    treeUtil.findPrevNextById(tree, 4).next._id.should.be.eql(5);
    should.not.exist(treeUtil.findPrevNextById(tree, 5).next);
  });

  it('finds prev', function() {
    should.not.exist(treeUtil.findPrevNextById(tree, 3).prev);
    treeUtil.findPrevNextById(tree, 4).prev._id.should.be.eql(3);
    treeUtil.findPrevNextById(tree, 5).prev._id.should.be.eql(4);
  });

});
