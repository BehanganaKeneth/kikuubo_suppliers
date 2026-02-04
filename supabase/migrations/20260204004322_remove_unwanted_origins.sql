/*
  # Remove Unwanted Product Origins

  Remove UAE, France, and Brazil from the product_origins table.
  Only Korea, Japan, Paris, USA, UK, and Body Supplements will remain.

  ## Changes
  - Delete UAE origin
  - Delete France origin  
  - Delete Brazil origin
*/

DELETE FROM product_origins 
WHERE slug IN ('uae', 'france', 'brazil');
