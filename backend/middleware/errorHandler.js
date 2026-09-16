function errorHandler(err, req, res, next) {
  // Custom errors raised via SIGNAL inside our stored procedures (e.g. "Insufficient balance...")
  if (err.sqlState === '45000') {
    return res.status(400).json({ message: err.sqlMessage });
  }

  // CHECK constraint violations (e.g. negative quantity/amount bypass attempts)
  if (err.errno === 3819) {
    return res.status(400).json({ message: 'Invalid data: a database constraint was violated.' });
  }

  // Duplicate unique key (e.g. email already registered)
  if (err.errno === 1062) {
    if (err.sqlMessage?.includes('uq_booking_feedback')) {
      return res.status(409).json({ message: 'You have already reviewed this item.' });
    }
    return res.status(409).json({ message: 'This record already exists.' });
  }

  // Invalid ENUM value (e.g. an unsupported role)
  if (err.errno === 1265) {
    return res.status(400).json({ message: 'Invalid value provided for one of the fields.' });
  }

  // FK constraint blocks delete (e.g. deleting a menu item that already has order history)
  if (err.errno === 1451) {
    return res.status(409).json({
      message: 'This item has existing order history and cannot be deleted. Hide it instead using the Available toggle.',
    });
  }

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;
